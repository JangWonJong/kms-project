from pymongo import MongoClient, DESCENDING,ASCENDING
import bcrypt
from flask import request, jsonify, make_response, current_app
from datetime import date, timedelta, datetime
import re
import time
import os
import jwt
import urllib.parse
from flask_wtf.csrf import generate_csrf
from flask_mail import Mail, Message

################# DB Setting #################################
dbconnect = os.environ.get("MONGO", os.environ.get(''))
# dbconnect = "mongodb://localhost:27017/"
client = MongoClient(dbconnect)
qdb = client['test']
kmsDefDB = qdb.kmsDefDB
userDB = qdb.userDB
kmsDefDB = qdb.kmsDefDB
userDB.create_index([("user_id", DESCENDING)], unique=True)
SECRET_KEY = os.environ.get('SECRET_KEY', os.environ.get(''))

CSRF_SECRET_KEY = os.environ.get('CSRF_SECRET_KEY', os.environ.get(''))
###############################################################



def signUp_user():
    # if userDB.count_documents({}) > 0:
    #     return jsonify({'message': '이미 관리자 계정이 존재하기 때문에 생성할 수 없습니다.', 'form': 'false'}), 200
    
    data = request.get_json()
    new_userId = data['user_id']
    new_password = data['user_pw']
    check_new_password = data['check_user_password']

    salt = bcrypt.gensalt()
    
    if not re.search(r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$", new_password):
        return jsonify({'message': '대문자, 특수문자를 포함하고 8자 이상의 비밀번호를 지정해주세요.', 'form': 'false'}), 200

    if new_password != check_new_password:
        return jsonify({'message': '비밀번호가 일치하지 않습니다. 다시 입력해주세요.', 'form': 'false'}), 200
    else:
        encode_password = bcrypt.hashpw(new_password.encode('utf-8'), salt)
        userDB.insert_one({'user_id': new_userId,
                                   'user_password': encode_password,
                                     'user_faild_cnt' : 0,
                                       'user_faild_last_time' : 0})
        return jsonify({'message': '관리자 등록이 완료되었습니다.', 'form': 'true'}), 200

def setting_user():
    data = request.get_json()
    user_id = data['user_id']
    new_password = data['user_password']
    check_new_password = data['check_user_password']
    user = userDB.find_one({'user_id': user_id})
    salt = bcrypt.gensalt()

    if not re.search(r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$", new_password):
        return jsonify({'message': '대문자, 특수문자를 포함하고 8자 이상의 비밀번호를 지정해주세요.', 'form': 'false'}), 200
    
    if new_password != check_new_password:
        return jsonify({'message': '비밀번호가 일치하지 않습니다. 다시 입력해주세요.', 'form': 'false'}), 200
    else:
        encode_password = bcrypt.hashpw(new_password.encode('utf-8'), salt)
        data['user_password'] = encode_password
        
    
    if user:
        userDB.update_one({'user_id': user_id}, {"$set": {'user_password': encode_password}})
        return jsonify({'message': '변경이 완료되었습니다.', 'form': 'true'}), 200
    else:
        return jsonify({'message': '관리자 아이디가 일치하지 않습니다.', 'form': 'false'}), 200

# injection 공격이 의심되는 특수문자가 포함되었을 경우 제거 해주는 함수
def escape_characters(str):
    characters = ['$', '&', '*', '(', ')', '+',
                   '|', '{', '}', '[', ']', '^',
                     '"', "'", '\\', '/', '?']
    for char in characters:
        str = str.replace(char, '\\' + char)
    return str

def login_user():
    ## 특정 user 접속 허용
    success_ip = "192.168.0.33" # 관리자 ip 사전 허용
    user_ip = request.remote_addr # 요청자의 api
    if success_ip != user_ip :
        response = make_response(jsonify({'message': '허용되지 않은 IP', 'form': 'false'}))    
        return response
    
    ## csrf 방어코드
    csrfToken_header = request.headers.get('X-Csrftoken')
    csrfToken_cookie = request.cookies.get('csrf_token')
    if csrfToken_header != csrfToken_cookie :
        response = make_response(jsonify({'valid': False, 'error': 'CSRF Token Invalid token'}))
        response.delete_cookie("user_data")
        response.delete_cookie("user_id")
        response.delete_cookie("csrf_token")
        response.delete_cookie("session")
        return response
    
    # input값 가져옴
    data = request.get_json()
    user_id =  data['user_id']
    password = data['user_pw']

    ## nosql injection 방어코드
    escape_user_id = escape_characters(user_id)
    escape_password = escape_characters(password)
    if escape_user_id != user_id or escape_password != password:
        return jsonify({'message': '다음 특수문자는 포함될 수 없습니다. \b $,&,*,(,),+,|,{,},[,],^,",\\,/,? ', 'form': 'false'}), 200

    ## DB에서 user 정보 찾음
    user = userDB.find_one({"user_id":user_id})
    if user == None :
        return jsonify({'message': '사용자 정보가 존재하지 않습니다.', 'form': 'false'}), 200

    user_pw = user.get('user_password')
    pw_check = bcrypt.checkpw(password.encode(), user_pw)

    LOGIN_ACCESS_LIMIT = 5      #로그인 제한 횟수
    LOGIN_TIME_LOCK = 60        #로그인 제한 시간(초)
    current_time = time.time()  # 현재시간

    # 비밀번호 강도 강화
    if not re.search(r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$", password):
        return jsonify({'message': '비밀번호는 대문자, 특수문자를 포함하고 8자 이상입니다.', 'form': 'false'}), 200
    
    # id pw 모두 일치시
    if pw_check is True:
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(minutes=30)
        }
        my_token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        # 마지막 로그인 시도 시간 - 현재시간 =  +일경우 로그인제한 -일경우 제한시간경과
        lock_time = int(LOGIN_TIME_LOCK - (current_time - user['user_faild_last_time']))
        # 제한시간 경과시 초기화
        if lock_time < 0 :
                user['user_faild_cnt'] = 0

        # 로그인 시도 제한 횟수 초과
        if user['user_faild_cnt'] >= LOGIN_ACCESS_LIMIT:
            return jsonify({'message': f'{lock_time}초 이후에 다시 로그인을 시도해주세요.', 'form': 'false'}), 200
        else:
            userDB.update_one({'user_id': user['user_id']}, {"$set": {'user_faild_cnt': 0, 'user_faild_last_time' : 0}})
            
        # xss 방어 코드    
            response = make_response(jsonify({'token': my_token}))

            # response.set_cookie("user_data", value=my_token, httponly=True, samesite='Strict', secure=True)
            response.set_cookie("user_data", value=my_token, httponly=True, samesite='none', secure=True)
            return response
    else:
        if user:
            lock_time = int(LOGIN_TIME_LOCK - (current_time - user['user_faild_last_time']))
            if lock_time < 0 :
                    user['user_faild_cnt'] = 0

            if user['user_faild_cnt'] >= LOGIN_ACCESS_LIMIT:
                return jsonify({'message': f'{lock_time}초 이후에 다시 로그인을 시도해주세요.', 'form': 'false'}), 200
            else:
                userDB.update_one({'user_id': user['user_id']},
                                          {"$set": {'user_faild_cnt': user['user_faild_cnt'] + 1,
                                                     'user_faild_last_time' : current_time}})
                return jsonify({'message': '사용자 정보가 일치하지 않습니다.', 'form': 'false'}), 200
        else:
            return jsonify({'message': '사용자 정보가 일치하지 않습니다.', 'form': 'false'}), 200

def logout_user():
    response = make_response()
    response.delete_cookie("user_data")
    response.delete_cookie("user_id")
    response.delete_cookie("csrf_token")
    response.delete_cookie("session")
    return response

def decode_token():
    token = request.cookies.get('user_data')
    if token:
        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            return jsonify({'valid': True})
        except jwt.ExpiredSignatureError:
            response = make_response(jsonify({'valid': False, 'error': 'Token has expired'}))
            response.delete_cookie("user_data")
            response.delete_cookie("user_id")
            response.delete_cookie("csrf_token")
            response.delete_cookie("session")           
            return response
        except jwt.InvalidTokenError:
            response = make_response(jsonify({'valid': False, 'error': 'Invalid token'}))
            response.delete_cookie("user_data")
            response.delete_cookie("user_id")
            response.delete_cookie("csrf_token")
            response.delete_cookie("session")
            return response
    else:
        return jsonify({'valid': False, 'error': 'Token not found'}), 404

def get_csrf_token():
    csrf_token = generate_csrf()
    response = make_response(jsonify({'csrf_token': csrf_token}))

    response.set_cookie("csrf_token", value=csrf_token, httponly=True, secure=True, samesite='none')
    return response

def find_expire_date_data():
    res = kmsDefDB.find()
    return res

def find_expire_date_data():
    res = kmsDefDB.find()
    return res
################################################################################

    
if __name__ == "__main__":
   pass