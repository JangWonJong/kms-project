
import bcrypt
from pymongo import MongoClient, DESCENDING,ASCENDING
from flask import request
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
import requests
from aes_module import encrypt_data, decrypt_data, mk_masterkey
from kms_service import byte_array_to_int_str, byte_array_to_short_str, get_byte_num_from_digit_size, get_byte_num_from_short_string_size, get_hex_string_by_size, build_uuid_type
import os
from datetime import datetime, timedelta, timezone
import redis
import itertools

################# DB Setting #################################
dbconnect = os.environ.get("MONGO", os.environ.get(''))
# dbconnect = "mongodb://localhost:27017/"
client = MongoClient(dbconnect)
qdb = client['test']
userDB = qdb.userDB
qkDB = qdb.qkDB
dekDB = qdb.dekDB
kmsDefDB = qdb.kmsDefDB
kmsDB = qdb.kmsDB
rsaDB = qdb.rsaDB
###############################################################


##### REDIS Reload     ########################################


rd = redis.StrictRedis(host='localhost', port=6379, db=0)    

pzl = ()
def redis_reload():
    global pzl
    upr = rd.lpop('data')
    amn = rd.lpop('data')
    zlc = rd.get(upr)
    ecl = rd.get(amn)
    pzl = bytes(itertools.chain(*zip(zlc,ecl)))
redis_reload()

##############################################################


def request_data():
    req_data = request.get_json()
    plain_data = req_data["plain_data"]
    kek_password = req_data['kek_password']
    user_id = req_data['user_id']
    key_name = req_data['key_name']
    return plain_data, kek_password, user_id, key_name


### PBKDF 방식 구현하기 위한 KEK 생성
def create_kek(user_id, password):
    try:
        pw_info = userDB.find_one({'user_id': user_id}).get('user_password')
        salt = pw_info[:29]
        res = bcrypt.hashpw(password.encode('utf-8'), salt)
        kek = res[:32]
    except:
        return({'msg': SystemError})
    return kek


# 암호화 적용 + RSA 방식 내보내기

def make_enckey(size,user_id, kek_password, key_name, expire_date, data_type):
    try:
        qkDB.create_index([("key_name", DESCENDING)], unique=True)
        dekDB.create_index([("key_name", DESCENDING)], unique=True)
        ###TTL 설정
        qkDB.create_index('expire_date', expireAfterSeconds=0)
        dekDB.create_index('expire_date', expireAfterSeconds=0)
        
        ls = qkDB.find_one({"key_name": key_name})  
        if ls != None:
            return "Use Another KeyName"
    except:
        return "index Error"
    
    if data_type =='UUID':
        size = 'UUID'
    else:
        digit_size = int(size)
    try:
        global pzl
        if data_type =='UUID':
            size = 'UUID'
            if len(pzl)<(int(32)):
                change = rd.lpop('data')
                change2 = rd.lpop('data')
                zlcf = rd.get(change)
                eclf = rd.get(change2)
                pzl = bytes(itertools.chain(*zip(zlcf,eclf)))

            res =(pzl[0:(int(32))])
            pzl = pzl[(int(32)):len(pzl)]
        
        elif data_type == 'digit':
            size = get_byte_num_from_digit_size(size)
        
        elif data_type =='short_string':
            size = get_byte_num_from_short_string_size(size)
        
        else:
            size = int(size)
        
        if data_type != 'UUID':
            if len(pzl)<(int(size)):
                change = rd.lpop('data')
                change2 = rd.lpop('data')
                zlcf = rd.get(change)
                eclf = rd.get(change2)
                pzl = bytes(itertools.chain(*zip(zlcf,eclf)))

            res =(pzl[0:(int(size))])
            pzl = pzl[(int(size)):len(pzl)]
       
    except:
        return "Redis Error"
    
    #Redis Pool에 저장된 난수 가져오기
    if data_type == 'hex':
        temp_size = int((int(digit_size) + 1) / 2)
        temp_hex_string  = get_hex_string_by_size(temp_size)
        r_string = temp_hex_string[:int(digit_size)] 
        res = r_string.encode('utf-8')

    elif data_type == 'digit':
        res = byte_array_to_int_str(res, digit_size).encode('utf-8')
    elif data_type == 'short_string':
        res = byte_array_to_short_str(res, digit_size).encode('utf-8')

    elif data_type == 'bytes':
        res = res
    elif data_type == 'UUID':
        res = build_uuid_type(str(res[0:4].hex()),str(res[4:6].hex()),str(res[6:8].hex()),str(res[8:10].hex()),str(res[10:16].hex())).encode('utf-8')
    else:
        res = "Invalid Type"

    if res == "Invalid Type":
        return "Try Again"
    else:
        plain_data=res
        ttl = datetime.strptime(expire_date, "%Y-%m-%d").replace(tzinfo=timezone(timedelta(hours=9)))
        ### kek 생성
        kek = create_kek(user_id, kek_password)
        dek = mk_masterkey()
        if len(kek_password) < 4:
            return "Invalid Password"
        else:
            ##### 암호화 로직
            encrypt_plain_data = encrypt_data(dek, plain_data)
            encrypt_plain_dek = encrypt_data(kek, dek)
            
            qkDB.insert_one({
                        "encrypted_data": encrypt_plain_data,
                        "key_name": key_name,
                        "expire_date" : ttl
            })
            dekDB.insert_one({
                        "encrypted_dek": encrypt_plain_dek,
                        "key_name": key_name,
                        "expire_date" : ttl
             })
            res = {"Upload Success" : str(plain_data)}
            return res

            


### 재발급 로직
def kek_test(user_id, kek_password, key_name):
       
    ### kek 복원
    restored_kek = create_kek(user_id, kek_password)
    #####
    #####복호화 로직
    #복호화 대상
    try:
        encrypted_plain_dek = dekDB.find_one({"key_name": key_name}).get("encrypted_dek")
        encrypted_plain_data = qkDB.find_one({"key_name": key_name}).get("encrypted_data")
    except:
        res = "KeyName Error"
        return res

    #dek 복호화
    decrypt_plain_dek = decrypt_data(restored_kek, encrypted_plain_dek)
    #dek 복호화 성공했을 때 plaindata 복호화 진행
    if len(decrypt_plain_dek) != 32:
        res ="Wrong Password"
        return res
    else:
        decrypt_plain_data = decrypt_data(decrypt_plain_dek, encrypted_plain_data)
        return str(decrypt_plain_data)


def dec_module():
    user_id = "basestone"
    kek_password = "1234"
    key_name = "asdf"
    try:
        kek = create_kek(user_id, kek_password)
    except:
        return ({'msg': ValueError})        
    
    encrypted_dek = dekDB.find_one({"key_name":key_name}).get("encrypted_dek")
    encrypted_plain_data = qkDB.find_one({"key_name":key_name}).get("encrypted_data")
    try:
        decrypt_plain_dek = decrypt_data(kek, encrypted_dek)
        decrypt_plain_data = decrypt_data(decrypt_plain_dek, encrypted_plain_data)
        print(decrypt_plain_data)
        print(len(decrypt_plain_data))
    except:
        return ({'msg': AttributeError})
    # try:
    #     public_key = get_rsa_key_pair()
    #     cipher = PKCS1_OAEP.new(RSA.import_key(public_key))
    #     encrypted_data = cipher.encrypt(decrypt_plain_data)
    #     target_address = 'https://192.168.0.21:5000/decrypt'
    #     response = requests.post(target_address, json = {'encrypted_message': encrypted_data.hex()})
    #     return response
    # except:
    #     return ({"msg": TimeoutError})


### RSA 로직

def get_rsa_key_pair():
    key_data = rsaDB.find_one()
    if key_data:
        public_key = key_data['public_key']
    else:
        key_pair = RSA.generate(2048)
        # private_key는 생성후 db에서 삭제 text만 따로 저장해서 client에게 전달
        private_key = key_pair.export_key()
        public_key = key_pair.publickey().export_key()
        rsaDB.insert_one({'private_key': private_key, 'public_key': public_key})

    return public_key

def delete_key(key_name):
    try:
        test = qkDB.find_one({"key_name":key_name}).get("key_name")
        if qkDB.find_one({'key_name': key_name}) and dekDB.find_one({'key_name': key_name}) is None:
            res = "Already deleted"
            return res
        else:
            ls = [qkDB, dekDB, kmsDefDB, kmsDB]
            for i in ls:
                i.delete_one({"key_name": key_name})
            ls2 = [kmsDB, kmsDefDB]
            for i in ls2:
                i.delete_one({"_id":key_name})
            return "deleted"
        
    except:
        return "None"
    

def delete_mongo():
    try:
        ls = [qkDB, dekDB, kmsDefDB, kmsDB]
        for i in ls:
            i.delete_many({})
        return "DELETED"
    except:
        return "ERROR"



    


if __name__ == "__main__":
    #create_kek()
    dec_module()
    #decrypt_test()