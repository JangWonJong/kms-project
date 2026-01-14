from pymongo import MongoClient
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import random


##############AES 암호화 QUARDIAN 적용#####################


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

##### iv(initialization vector) 생성 -> 첫블록 암호하는데 사용
def mk_iv():
    iv = rand_bin(AES.block_size)
    return iv

##### 패딩 처리
BS = AES.block_size
pad = (lambda s: s+ (BS - len(s) % BS) * chr(BS - len(s) % BS).encode())

#####양자난수암호화키 생성(QK)
def mk_qk(size):
    qk = rand_bin(size)
    return qk


##### 양자난수로 키를 256bit로 만들어 암호화키로 사용
def mk_masterkey():
    ########QRNG로 대체 예정
    masterkey = rand_bin(32)
    return masterkey


# 암호화 함수
def encrypt_data(key, plaintext):
    ### 암호화 설정 값 세팅
    iv = mk_iv()
    padded_text = pad(plaintext)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    encrypted_data = cipher.encrypt(padded_text)
    
    #### iv 값을 같이 리턴해주는 이유 모르겠음
    #return encrypted_data
    return iv + encrypted_data

unpad = (lambda s: s[:-ord(s[len(s)-1:])])

# 복호화 함수
def decrypt_data(key, encrypted_data):
    iv = encrypted_data[:BS]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted_data = unpad(cipher.decrypt(encrypted_data[BS:]))
    return decrypted_data