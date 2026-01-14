from flask import Flask, request, redirect
from flask_cors import CORS
#################################################################
from kms_service import *
from quardian_service import kek_test, make_enckey, dec_module, delete_mongo, delete_key
from register import signUp_user, login_user, setting_user, logout_user, decode_token, get_csrf_token, find_expire_date_data
# from mail_scheduler import scheduler_mailling
# from renewal_quardian import enc_md, kek_test, create_kek
#################################################################
from kms_service import get_kms_key, getting_key_definition, ui_delete_key_definition,ui_update_key_definition,ui_fetch_key_definition,ui_create_key_definition, key_log,get_key_log,fetch_key_list, fetch_key_definition, update_key_definition,create_key_definition,delete_key_definition,key_data_insert,kms_keys,kms_hex, key_data_refresh
import os
from register import CSRF_SECRET_KEY
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from flask_mail import Mail, Message

app = Flask(__name__)
app.config['SECRET_KEY'] = CSRF_SECRET_KEY
test = app.config['SECRET_KEY']
CORS(app, supports_credentials=True, origins="https://192.168.0.4:3000")


########################
# 메일링 서비스
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'nicet.shlee@gmail.com'
app.config['MAIL_PASSWORD'] = 'xfxemehnpsupmkdz'
# app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
# app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)
###########################


@app.route('/send_mail', methods=['GET', 'POST'])
def send_mail_api():
    with app.app_context():
        res = find_expire_date_data()
        current_date = datetime.utcnow()

        for document in res:
            if document["r_expire_date"] - timedelta(days=30) < current_date : # 만료일자-1달을 한 상태가 현재날짜보다 작을때 (만료1달이전)
                print("메일")
                date = document["r_expire_date"] - current_date
                msg = Message(document["_id"] + "의 만료가 " + str(date.days) + "일 남았습니다.",
                               sender = 'nicet.shlee@gmail.com',
                                 recipients = ['23hoon@basestone.co.kr'])
                msg.body = '만료되기 이전에 갱신해주세요.\n갱신하지 않을 경우 암호화 키는 소멸됩니다.\n기타 기술지원 관련 문의는 본사로 연락주세요.'
                mail.send(msg)
                return msg
        return jsonify({'message': '메일이 전송되었습니다.'}), 200

# 스케줄러
schedule = BackgroundScheduler(daemon=True, timezone='Asia/Seoul')
schedule.add_job(send_mail_api, 'interval', seconds=100000000)
schedule.start()




@app.before_request
def before_request():
    if request.url.startswith('http://'):
        url = request.url.replace('http://', 'https://', 1)
        code = 301
        return redirect(url, code=code)

@app.errorhandler(500)
def error_handling_500(error):
    return ({"code":'500'}), 500

@app.get("/")
def home():
    return "Quardian"

# user setting change
@app.route('/setting_user', methods = ['POST'])
def kms_setting_user():
    res = setting_user()
    return res

###회원가입
@app.route('/join', methods=['GET', 'POST'])
def join_api():
    res = signUp_user()
    return res


###로그인
@app.route('/login_user', methods=['GET', 'POST'])
def login_api():
    res = login_user()
    return res

###로그아웃
@app.route('/logout_user', methods=['GET', 'POST'])
def logout_api():
    res = logout_user()
    return res

### 토큰 검증을 위한 API 호출
@app.route('/decode_token', methods=['GET', 'POST'])
def decode_token_api():
    res = decode_token()
    return res

### CSRF 방어 코드 
@app.route('/get_csrf_token', methods=['GET'])
def get_csrf_token_api():
    res = get_csrf_token()
    return res

"""
### QK 생성(bytes type)
@app.route('/bytes/<size>', methods=['GET', 'POST'])
def maek_qk(size):
    res = rand_bin(size)
    return "Quardian Key : %s" %res
"""



def request_data():
    try:
        req_data = request.get_json()
        kek_password = req_data['kek_password']
        user_id = req_data['user_id']
        key_name = req_data['key_name']
        size = req_data['size']
        expire_date = req_data['expire_date']
        data_type = req_data['data_type']
        return kek_password, user_id, key_name, size, expire_date, data_type
    except:
        return "Blanked"


#통합 테스트
@app.route('/issue_key', methods=['GET', 'POST'])
def issue_key():
    try:
        kek_password, user_id, key_name, size, expire_date, data_type = request_data()
        res = make_enckey(size, user_id, kek_password, key_name, expire_date, data_type)
    
        return res
    except:
        return "Blanked"

### 암호화 키 만료일 갱신 
@app.route('/key_data_refresh', methods=['GET', 'POST'])
def key_data_refresh_api():
    try:
        data = request.get_json()
        key_name = data['key_name']

        res = key_data_refresh(key_name)
        return res
    except:
        return "Blanked"


@app.route('/reissuance_key', methods=['GET', 'POST'])
def reissue_key():
    try:        
        kek_password, user_id, key_name, size, expire_date, data_type = request_data()
   
        res = kek_test(user_id, kek_password, key_name)

        return res
    except:
        return "Blanked"

@app.route('/del', methods=['GET', 'POST'])
def del_all():
    res = delete_mongo()
    
    return res

@app.route('/delete_issued_key', methods=['GET', 'POST'])
def del_key():
    try:
        data = request.get_json()
        key_name = data['key_name']
        res = delete_key(key_name)
        return res

    except:
        res = "selected msg"
        return res


    
@app.route('/send_rsa', methods=['GET', 'POST'])
def decrypt_send():
    data = request.get_json()
    user_id = data['user_id']
    kek_password = data['kek_password']
    key_name = data['key_name']
    res = dec_module( user_id, kek_password, key_name)
    
    return res


# 몽고 DB 연결 부분

# Flask 동작

# CORS 처리

##### KMS PART
@app.route('/key_log', methods = ['POST'])
def kms_key_log():
    res = key_log()
    return res

@app.route('/get_key_log', methods = ['POST'])
def kms_get_key_log():
    res = get_key_log()
    return res

@app.route('/fetch_key_list', methods = ['POST'])
def kms_fetch_key_list():
    res =fetch_key_list()
    return res

@app.route('/fetch_key_definition', methods = ['POST'])
def kms_ui_fetch_key_definition():
    res = ui_fetch_key_definition()
    return res

@app.route('/create_key_definition', methods = ['POST'])
def kms_ui_create_key_definition():
    res =ui_create_key_definition()
    return res

@app.route('/delete_key_definition', methods = ['POST'])
def kms_ui_delete_key_definition():
    res =ui_delete_key_definition()
    return res

@app.route('/update_key_definition', methods = ['POST'])
def kms_ui_update_key_definition():
    res =ui_update_key_definition()
    return res


@app.route('/key_data_insert', methods = ['POST'])
def kms_key_data_insert():
    res = key_data_insert()
    return res

#################################
## API KMS Controll

@app.route('/kms/fetch_key_definition', methods = ['POST'])
def kms_fetch_key_definition():
    res = fetch_key_definition()
    return res

@app.route('/kms/create_key_definition', methods = ['POST'])
def kms_create_key_definition():
    res =create_key_definition()
    return res

@app.route('/kms/delete_key_definition', methods = ['POST'])
def kms_delete_key_definition():
    res = delete_key_definition()
    return res

@app.route('/kms/update_key_definition', methods = ['POST'])
def kms_update_key_definition():
    res = update_key_definition()
    return res


@app.route('/kms/getting_key_definition', methods = ['POST'])
def kms_getting_key_definition():
    res = getting_key_definition()
    return res


@app.route('/kms/endpoint/<_id>', methods = ['POST'])
def kms_get_kms_key(_id):
    res = get_kms_key(_id)
    return res



## FOR KMS without Auth
@app.route('/kmsui/<type>/<size>', methods = ['POST'])
def kms_key_create(type,size):
    res = kms_keys(type=type,size=size)
    return res

@app.route('/kmsui/hex/<size>', methods = ['POST'])
def kms_hex_key_create(size):
    res = kms_hex(size=size)
    return res

@app.route('/kmsui/uuid', methods = ['POST'])
def kms_uuid_key_create():
    res = kms_uuid()
    return res

""" 
from renewal_quardian import make_enckey_test
@app.route('/test_controller', methods=['GET', 'POST'])
def test_controller():
    kek_password, user_id, key_name, size, expire_date, data_type = request_data()
    res = make_enckey_test(size, user_id, kek_password, key_name, expire_date, data_type)
    
    return res

from type_test import t_test, delete_mongo

@app.route('/type_test', methods=['GET', 'POST'])
def type_test():
    kek_password, user_id, key_name, size, expire_date, data_type = request_data()
    res = t_test(size, user_id, kek_password, key_name, expire_date, data_type)
    
    return res
"""




if __name__ == "__main__":
    # app.run()
    #ssl_context = ( 'C:\\Users\\USER\\quardiangit\\encrpt_test\\quardian-front\\servcert.pem', 'C:\\Users\\USER\\quardiangit\\encrpt_test\\quardian-front\\servkey.pem' )
    ssl_context = ( 'C:\\Users\\USER\\quardiangit\\encrpt_test\\quardian-front\\192.168.0.4.pem', 'C:\\Users\\USER\\quardiangit\\encrpt_test\\quardian-front\\192.168.0.4-key.pem' )

    app.run(ssl_context=ssl_context, debug=False, host='192.168.0.4', port=5000)


   
