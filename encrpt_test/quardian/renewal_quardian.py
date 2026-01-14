
import bcrypt
from pymongo import MongoClient, DESCENDING,ASCENDING
from flask import request
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
import requests
from aes_module import encrypt_data, decrypt_data, mk_masterkey, mk_qk
import os
from datetime import datetime, timedelta, timezone
import pytz

################# DB Setting #################################
dbconnect = os.environ.get("MONGO", os.environ.get(''))
#dbconnect = "mongodb://WJ:qpdltmtmxhs8048!!@localhost:27017/"
client = MongoClient(dbconnect)
qdb = client['test']
userDB = qdb.userDB
qkDB = qdb.qkDB
dekDB = qdb.dekDB
kmsDefDB = qdb.kmsDefDB
rsaDB = qdb.rsaDB

#keyName 중복 X 처리
qkDB.create_index([("key_name", DESCENDING)], unique=True)
###TTL 설정
qkDB.create_index('expire_date', expireAfterSeconds=0)


###############################################################


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



### Quardian data Encryption
def enc_md(size, user_id, kek_password, key_name):
    ### 양자난수 생성기로 대체 예정
    
    try:
        plain_data = mk_qk(size)
        ### kek 생성
        kek = create_kek(user_id, kek_password)
        dek = mk_masterkey()
        
        if len(kek_password) < 4 and len(kek_password)>13:
            return "Invalid Password"
        else:
            ##### 암호화 로직
            encrypt_plain_data = encrypt_data(dek, plain_data)
            encrypt_plain_dek = encrypt_data(kek, dek)
            
            test = kmsDefDB.find_one({"_id":key_name}).get("_id")
            print(test)

        #중복keyName 허용 X -> 관련 로직 생성해야함    
        if test == key_name:
            res = "Use another key name"
            return res
        elif encrypt_plain_data and encrypt_plain_dek is not None:
            qkDB.insert_one({
                "encrypted_data": encrypt_plain_data,
                "key_name": key_name
                })
            dekDB.insert_one({
                "encrypted_dek": encrypt_plain_dek,
                "key_name": key_name
            })
            res = "Upload Success"
        return res

    except:
        res = ""
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
        print(decrypt_plain_data)
        return decrypt_plain_data
    



###########기존 Quardian에 적용
import redis
import itertools

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


# 암호화 적용 + RSA 방식 내보내기

from kms_service import byte_array_to_int_str, byte_array_to_short_str, get_byte_num_from_digit_size, get_byte_num_from_short_string_size, get_hex_string_by_size, build_uuid_type

###타입별 수정중
def make_enckey_test(size,user_id, kek_password, key_name, expire_date, data_type):
    try:
        qkDB.create_index([("key_name", DESCENDING)], unique=True)
        dekDB.create_index([("key_name", DESCENDING)], unique=True)
        ###TTL 설정
        qkDB.create_index([("key_name", DESCENDING)], unique=True)
        dekDB.create_index('expire_date', expireAfterSeconds=0)
    except:
        return "index Error"
    
    if data_type =='UUID':
        size = 'UUID'
    else:
        size = int(size)
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
        else:
            size = int(size)
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
    
    try:
        if data_type == 'digit':
            size = get_byte_num_from_digit_size(size)
        if data_type == 'short_string':
            size = get_byte_num_from_short_string_size(size)
    except:
        return "Type Error"
    
    print(res)
    #Redis Pool에 저장된 난수 가져오기
    if data_type == 'hex':
        temp_size = int((int(size) + 1) / 2)
        temp_hex_string  = get_hex_string_by_size(temp_size)
        r_string = temp_hex_string[:int(size)] 
        res = r_string.encode('utf-8')

    elif data_type == 'digit':
        res = byte_array_to_int_str(res, size).encode('utf-8')

    elif data_type == 'short_string':
        res = byte_array_to_short_str(res, size).encode('utf-8')

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
        print(plain_data)
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
        try:
            if encrypt_plain_data and encrypt_plain_dek is not None:
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
                res = "Upload Success"
                return res
        except:
            res = "Use Another KeyName"
            return res                
   
            

def dec_module(user_id, kek_password, key_name):
    user_id = "basestone"
    kek_password = "1234"
    key_name = "zxcv"
    try:
        kek = create_kek(user_id, kek_password)
    except:
        return ({'msg': ValueError})        
    
    encrypted_dek = dekDB.find_one({"key_name":key_name}).get("encrypted_dek")
    encrypted_plain_data = qkDB.find_one({"key_name":key_name}).get("encrypted_data")
    try:
        decrypt_plain_dek = decrypt_data(kek, encrypted_dek)
        decrypt_plain_data = decrypt_data(decrypt_plain_dek, encrypted_plain_data)
    except:
        return ({'msg': AttributeError})
    try:
        public_key = get_rsa_key_pair()
        cipher = PKCS1_OAEP.new(RSA.import_key(public_key))
        encrypted_data = cipher.encrypt(decrypt_plain_data)
        target_address = 'https://192.168.0.21:5000/decrypt'
        response = requests.post(target_address, json = {'encrypted_message': encrypted_data.hex()})
        return response
    except:
        return ({"msg": TimeoutError})


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





    


if __name__ == "__main__":
    #create_kek()
    kek_test()
    #decrypt_test()