
import random
from quardian.aes_module import encrypt_data, decrypt_data, mk_qk, mk_masterkey
from pymongo import MongoClient, DESCENDING,ASCENDING
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from quardian.register import signUp_user, login_user
from flask import request, jsonify
import bcrypt
import os

################# DB Setting #################################
dbconnect = os.environ.get("MONGO", os.environ.get(''))
#dbconnect = "mongodb://WJ:qpdltmtmxhs8048!!@localhost:27017/"
client = MongoClient(dbconnect)
qdb = client['test']
qkDB = qdb.qkDB
dekDB = qdb.dekDB
userDB = qdb.userDB
rsaDB = qdb.rsaDB

###############################################################

##############RSA LOGIC

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


#### bin 파일 랜덤으로 읽어오기 ---> qstream과 비슷한 더미데이터
def rand_bin(num_bytes):
    file_path = "v2.1-nrbg-1.bin"
    num_bytes = int(num_bytes)
    with open(file_path, 'rb') as f:
        file_size = f.seek(0,2)
        start_position = random.randint(0, file_size - num_bytes)
        f.seek(start_position)
        read_data = f.read(num_bytes)
    return read_data


# user 비밀번호를 통해 kek를 생성
# user password의 해시값에서 salt를 추출하여 hash값을 만듦 -> kek
def crt_kek():
    data = request.get_json()
    user_id = data['user_id']
    password = data['input_password'].encode()
    #user password 불러와서
    pw_info = userDB.find_one({"user_id":user_id}).get('user_password')
    #salt 추출
    salt = pw_info[:29]
    #kek 생성
    kek = bcrypt.hashpw(password, salt)[:32]
   
    return kek


### 암호화 모듈
def encrypt_module():
    # Quardian key 생성
    qk = mk_qk(10)
    # DEK 생성
    dek = mk_masterkey()
    # KEK 생성
    kek = crt_kek()
    
    if dek and kek is not None:
        # QK 암호화
        eqk = encrypt_data(dek, qk)
        qkDB.insert_one({
        'origin' : qk,
        'encrypted_data' : eqk
        })

        edek = encrypt_data(kek, dek)
        dekDB.insert_one({
        'encrypted_dek': edek,
        'origin_dek': dek
        })
        res = eqk, edek, kek
        return res
        
    else:
        return "Key Error"
        
   

### 복호화 모듈
def decrypt_module():
    data = request.get_data()
    #get_edek = data['encrypted_dek']
    #get_eqk = data['encrypted_qk']

    
    pwd = request.get_json()
    user_id = pwd['user_id']
    password = pwd['input_password'].encode()
    #user password 불러와서
    pw_info = userDB.find_one({"user_id":user_id}).get('user_password')
    #salt 추출
    salt = pw_info[:29]
    #kek 생성
    hahsed_val = bcrypt.hashpw(password, salt)
    kek = hahsed_val[:32]

    pw_check = bcrypt.checkpw(password, hahsed_val)
    print(pw_check)

    if pw_check is True:
        return kek
    else:
        msg = "Wrong Password"
        return msg

    #edek = dekDB.find_one({'encrypted_dek':get_edek}).get('encrypted_dek')
    #eqk = qkDB.find_one({'encrypted_qk' : get_eqk}).get('encypted_qk')
    
    ### DB 비교
    #ddek = decrypt_data(kek, edek)
    #dqk = decrypt_data(ddek, eqk)

    


def decrypt_module2():
    eqk , edek, kek = encrypt_module()
    ddek = decrypt_data(kek, edek)
    dqk = decrypt_data(ddek, eqk)
    
    return dqk

def send_rsa():
    message = decrypt_module2()
    public_key = get_rsa_key_pair()
    cipher = PKCS1_OAEP.new(RSA.import_key(public_key))
    encrypted_data = cipher.encrypt(message)
    
    return encrypted_data

# 복호화

def decrypt_md():
    data = request.get_json()
    user_id = data['user_id']
    password = data['input_password'].encode()
    #encrypted_dek = data['encrypted_dek']
    #user password 불러와서
    pw_info = userDB.find_one({"user_id":user_id}).get('user_password')
    #salt 추출
    salt = pw_info[:29]
    #kek 생성
    kek = bcrypt.hashpw(password, salt)[:32]

    test = list(dekDB.find({}))[0]['encrypted_dek']
    edek = dekDB.find_one({"encrypted_dek": test}).get('encrypted_dek')
    dek = dekDB.find_one({"encrypted_dek": test}).get('origin_dek')
    print(dek)
    
    decrypt_dek = decrypt_data(kek, edek)
    ls = decrypt_dek == dek

    if ls is False:
        msg = "Wrong Password"
        return msg
    else :
        decrypt_dek = decrypt_data(kek, edek)
        print(decrypt_dek)
        return decrypt_dek
