import redis
import itertools
import json
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient, ASCENDING, DESCENDING
import os
from flask import request, make_response, jsonify

rd = redis.StrictRedis(host='localhost', port=6379, db=0)

dbconnect = os.environ.get("MONGO", os.environ.get(''))
# dbconnect = "mongodb://localhost:27017/"
client = MongoClient(dbconnect)
db = client['test']
db.kmsDB.create_index('expire_date', name ='expireindex', expireAfterSeconds=0)
db.kmsDB.create_index([("key_name", DESCENDING)], unique=True)
db.kmsDefDB.create_index('r_expire_date', name ='expireindex', expireAfterSeconds=10)


pzl = ()
def redis_reload():
    try:
        global pzl
        upr = rd.lpop('data')
        amn = rd.lpop('data')
        zlc = rd.get(upr)
        ecl = rd.get(amn)
        pzl = bytes(itertools.chain(*zip(zlc,ecl)))
    except:
        msg = "Excute Extractor"
        return msg
redis_reload()


def get_keys(type,size):
    global pzl
    digit_size = int(size)


    if type == 'digit':
        size = get_byte_num_from_digit_size(size)
    if type == 'short_string':
        size = get_byte_num_from_short_string_size(size)

    if len(pzl)<(int(size)):
        change = rd.lpop('data')
        change2 = rd.lpop('data')
        zlcf = rd.get(change)
        eclf = rd.get(change2)

        pzl = bytes(itertools.chain(*zip(zlcf,eclf)))

    resHex =(pzl[0:(int(size))])
    pzl = pzl[(int(size)):len(pzl)]

    if type == 'hex':
        temp_size = int((int(size) + 1) / 2)
        temp_hex_string  = get_hex_string_by_size(temp_size)
        r_string = temp_hex_string[:int(size)] 
        get_AES = r_string
        return get_AES
        
    if type == 'digit':
        get_number_digit = byte_array_to_int_str(resHex, digit_size)
        return get_number_digit

    if type == 'short_string':
        get_short_string = byte_array_to_short_str(resHex, digit_size)
        return get_short_string

    if type == 'bytes':
        get_AES = str(resHex)
        return get_AES
    
def build_uuid_type(first,second,third,fourth,fifth):
        arr =[]
        arr.append(first)
        arr.append(second)
        arr.append(third)
        arr.append(fourth)
        arr.append(fifth)
        arr = '-'.join(arr)
        return arr

def get_uuid():
    global pzl
    if len(pzl)<(int(32)):
        change = rd.lpop('data')
        change2 = rd.lpop('data')
        zlcf = rd.get(change)
        eclf = rd.get(change2)

        pzl = bytes(itertools.chain(*zip(zlcf,eclf)))


    resHex =(pzl[0:(int(32))])
    pzl = pzl[(int(32)):len(pzl)]
    get_hex_uuid = build_uuid_type(str(resHex[0:4].hex()),str(resHex[4:6].hex()),str(resHex[6:8].hex()),str(resHex[8:10].hex()),str(resHex[10:16].hex()))
    return get_hex_uuid

        

def key_log():
    try:
        data = request.get_json()
        db.kmsDB.insert_one(data)
        rval = {'msg': 'Success'}
    except:
        rval = {'msg': "Upload Failed"}
    return (rval)

def fetch_key_list(): 
    csrfToken_header = request.headers.get('X-Csrftoken')
    csrfToken_cookie = request.cookies.get('csrf_token')
    if csrfToken_header == None or csrfToken_cookie == None:
        response = make_response({'message': '인증이 유효하지 않습니다, 다시 로그인해주세요.', 'form': 'false'})
        return response

    if csrfToken_header != csrfToken_cookie :
        response = make_response({'message': '인증이 유효하지 않습니다, 다시 로그인해주세요.', 'form': 'false'})
        response.delete_cookie("user_data")
        response.delete_cookie("user_id")
        response.delete_cookie("csrf_token")
        response.delete_cookie("session")
        return response   
    api_list=[]
    for x in db.kmsDefDB.find({},{'r_expire_date':0}):
        api_list.append(x)
    return json.dumps({'code': '200', 'data': api_list})

def get_key_log():
    csrfToken_header = request.headers.get('X-Csrftoken')
    csrfToken_cookie = request.cookies.get('csrf_token')
    if csrfToken_header != csrfToken_cookie :
        response = make_response(jsonify({'valid': False, 'error': 'CSRF Token Invalid token'}))
        response.delete_cookie("user_data")
        response.delete_cookie("user_id")
        response.delete_cookie("csrf_token")
        response.delete_cookie("session")
        return response  
    api_list =[]
    for x in db.kmsDB.find({},{'_id':0}).sort('change_date',-1):
        api_list.append(x)
    return json.dumps({'code': '200', 'data': api_list})


#########################################
def create_key_definition():
    try:
        tdata = request.headers
        token = tdata['Authorization']
        # bearer_token =db.bearer_token.find_one({},{'_id':0,'token':1})
    except:
        return ({'msg':'Authorization Error'}),401    
    if token ==(rd.get("bearer_token")).decode('utf-8'):
        try:
            issueDate = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            data = request.get_json()
            ttl_date = datetime.strptime(data['expire_date'], "%Y-%m-%d").replace(tzinfo=timezone(timedelta(hours=9)))
            res={
                "_id": data['_id'],
                "user_group":data['user_group'],
                "data_type":data['data_type'],
                "size": int(data['size']),
                "requester":data['requester'],
                "r_expire_date":ttl_date,
                "expire_date":data['expire_date'],
                "issue_date":issueDate,
                #"key_value":''
                }
            db.kmsDefDB.insert_one(res)
        except:
            return ({'msg':'Key Data Error'}),400
    else :
        return ({'msg':'Authorization Error'}),401 
    return {'msg': "Success"},200

def fetch_key_definition():
    try:
        tdata = request.headers
        token = tdata['Authorization']
        # bearer_token =db.bearer_token.find_one({},{'_id':0,'token':1})
    except:
        return ({'msg':'Authorization Error'}),401    
    if token ==(rd.get("bearer_token")).decode('utf-8'):
        try:
            data1 = request.data
            data = request.get_json() 
            rval = db.kmsDefDB.find_one(data,{'r_expire_date':0})
        except:
            return ({'msg':'Key Data Error'}),400
    else :
        return ({'msg':'Authorization Error'}),401 
 
    return rval

def update_key_definition():
    try:
        tdata = request.headers
        token = tdata['Authorization']
        # bearer_token =db.bearer_token.find_one({},{'_id':0,'token':1})
    except:
        return ({'msg':'Authorization Error'}),401  
    data = request.get_json()      
    if token ==(rd.get("bearer_token")).decode('utf-8'):
        if(db.kmsDefDB.find_one({'_id':data['_id']})==None):
            return{'error':'No such Keys'}
        try:
            
            ttl_date = datetime.strptime(data['expire_date'], "%Y-%m-%d").replace(tzinfo=timezone(timedelta(hours=9)))
            res={
                "user_group":data['user_group'],
                "data_type":data['data_type'],
                "size": int(data['size']),
                "requester":data['requester'],
                "r_expire_date":ttl_date,
                "expire_date":data['expire_date'],
                }
            db.kmsDefDB.update_one({'_id':data['_id']},{"$set":res})
        except:
            return ({'msg':'Key Data Error'}),400
    else :
        return ({'msg':'Authorization Error'}),401 
 
    return {'msg': "Success"},200

def delete_key_definition():
    try:
        tdata = request.headers
        token = tdata['Authorization']
        # bearer_token =db.bearer_token.find_one({},{'_id':0,'token':1})
    except:
        return ({'msg':'Authorization Error'}),401    
        
    if token ==(rd.get("bearer_token")).decode('utf-8'):
        data = request.get_json()
        if(db.kmsDefDB.find_one(data)==None):
            return{'error':'No such Keys'}
        try:
            db.kmsDefDB.delete_one(data)
        except:
            return ({'msg':'Key Data Error'}),400
    else :
        return ({'msg':'Authorization Error'}),401 
 
    return {'msg': "Success"},200

def getting_key_definition():
    try:
        tdata = request.headers
        token = tdata['Authorization']
        # bearer_token =db.bearer_token.find_one({},{'_id':0,'token':1})
    except:
        return ({'msg':'Authorization Error'}),401    
    if token ==(rd.get("bearer_token")).decode('utf-8'):
        try:
            data = request.get_json()
            fdata = db.kmsDefDB.find_one(data,{'r_expire_date':0})
            type = fdata['data_type']
            size = fdata['size']
            log_data = {
                '_id':fdata['_id'],
                'user_group':fdata['user_group'],
                'data_type':fdata['data_type'],
                'size':fdata['size'],
                'requester':fdata['requester'],
                'expire_date':fdata['expire_date']
            }
            if type =="UUID":
                rval =get_uuid()
                kdata = {"key_value": rval}
                res = dict(data,**kdata)
                l_data = dict(log_data,**kdata)
                db.kmsDB.insert_one(l_data)
                db.kmsDefDB.update_one({'_id':fdata['_id']},{"$set":res})
            else :
                rval =get_keys(type=type,size=size)
                kdata = {"key_value": rval}
                res = dict(data,**kdata)
                l_data = dict(log_data,**kdata)
                db.kmsDB.insert_one(l_data)
                db.kmsDefDB.update_one({'_id':fdata['_id']},{"$set":res})
        except:
            return ({'msg':'Key Data Error'}),400
    else :
        return ({'msg':'Authorization Error'}),401 
 
    return ({"key":rval})

def get_kms_key(keyname):
    try:
        tdata = request.headers
        token = tdata['Authorization']
        bearer_token =db.bearer_token.find_one({},{'_id':0,'token':1})
    except:
        return ({'msg':'Authorization Error'}),401    
    if token== bearer_token["token"]:
        try:
            data = {"_id":keyname}
            rval = db.kmsDefDB.find_one(data,{'r_expire_date':0})
            rval = rval['key_value']
        except:
            return ({'msg':'Key Data Error'}),400
    else :
        return ({'msg':'Authorization Error'}),401 
 
    return ({"key":rval})

def key_data_refresh(key_name):
    current_date = datetime.utcnow()
    data = db.kmsDefDB.find_one({"_id":key_name})

    if data["r_expire_date"] - timedelta(days=30) < current_date :          # 만료날짜가 현재날짜 30일이내일때만 6개월 갱신

        data["r_expire_date"] += timedelta(days=180)                        # date 타입 6개월 갱신

        str_expire_date = datetime.strptime(data['expire_date'], '%Y-%m-%d')# string 타입 6개월 갱신
        refresh_str_expire_date = str_expire_date + timedelta(days=180)
        str_expire_date = refresh_str_expire_date.strftime('%Y-%m-%d')

        update_date = {
            "r_expire_date":data["r_expire_date"],
            "expire_date":str_expire_date,
            }
        db.kmsDefDB.update_one({"_id": data['_id']}, {"$set": update_date})

        return jsonify({'message': '갱신이 완료되었습니다.', 'form': 'true'}), 200
    else :
        return jsonify({'message': '만료일 1달 이내에만 갱신을 할 수 있습니다.', 'form': 'false'}), 200


################################################

def ui_create_key_definition():
    try:
        data = request.get_json()
        ttl_date = datetime.strptime(data['expire_date'], "%Y-%m-%d").replace(tzinfo=timezone(timedelta(hours=9)))
        if data['data_type'] == 'UUID':
            res={
                "_id": data['_id'],
                "user_group":data['user_group'],
                "data_type":data['data_type'],
                "size": "UUID",
                "requester":data['requester'],
                "r_expire_date":ttl_date,
                "expire_date":data['expire_date'],
                "issue_date":data['issue_date'],
                }
            db.kmsDefDB.insert_one(res)
            
        else:
            res={
                "_id": data['_id'],
                "user_group":data['user_group'],
                "data_type":data['data_type'],
                "size": int(data['size']),
                "requester":data['requester'],
                "r_expire_date":ttl_date,
                "expire_date":data['expire_date'],
                "issue_date":data['issue_date'],
                }
            db.kmsDefDB.insert_one(res)

        return "Upload Success"
    except ValueError :
        return "failed"
    except :
        return "Key Error"
    

def ui_fetch_key_definition():
    data = request.get_json() 
    rval = db.kmsDefDB.find_one(data,{'r_expire_date':0})
    return json.dumps({'code': '200', 'data': rval})

def ui_update_key_definition():
    data = request.get_json() 
    ttl_date = datetime.strptime(data['expire_date'], "%Y-%m-%d").replace(tzinfo=timezone(timedelta(hours=9)))
    res={
        "user_group":data['user_group'],
        #"data_type":data['data_type'],
        "size": int(data['size']),
        "requester":data['requester'],
        "r_expire_date":ttl_date,
        "expire_date":data['expire_date'],
        }
    db.kmsDefDB.update_one({'_id':data['_id']},{"$set":res})
    return {'msg': 'Success'},200

def ui_delete_key_definition():
    data = request.get_json()
    db.kmsDefDB.delete_one(data)
    return {'msg': 'Success'},200


#################################################################3

def key_data_insert():
    try:
        data = request.get_json() 
        db.kmsDefDB.update_one({'_id':data['_id']},{"$set":data},)
        rval2 = db.kmsDefDB.find_one({'_id':data['_id']},{'r_expire_date':0})
        return json.dumps(rval2)
    except:
        return "invalid data"
        




# def change_invalidate():
#     data = request.get_json()
#     rval = env.update_row(table = 'key_definition', key = "key_name", data = data)
#     rval2 =env.fetch_row(table = 'key_definition', key = "key_name", data = data)
#     return json.dumps(rval2)





## KMS API KEY CREATE

def kms_keys(type,size):
    try:
        global pzl
    
        data = request.get_json()
        # exdate_val = (item['expire_date'] for item in rval)
        # expire_date=next(exdate_val)
        # now = datetime.now()
        # exdate =datetime.strptime(expire_date,"%Y-%m-%d %H:%M:%S")

        # date_diff = exdate-now
        # cut_date = str(date_diff)[0:1]
        # if cut_date =='-' :
            # return ("KEY EXPIRED")
        ##
        ## digit, short_string의 경우 byte수와 다르므로 이를 계산함
        ## 
        digit_size = int(size)
        if type == 'digit':
            size = get_byte_num_from_digit_size(size)
        if type == 'short_string':
            size = get_byte_num_from_short_string_size(size)

        if len(pzl)<(int(size)):
            change = rd.lpop('data')
            change2 = rd.lpop('data')
            zlcf = rd.get(change)
            eclf = rd.get(change2)

            pzl = bytes(itertools.chain(*zip(zlcf,eclf)))

        resHex =(pzl[0:(int(size))])
        pzl = pzl[(int(size)):len(pzl)]

        if type == 'digit':
            get_number_digit = byte_array_to_int_str(resHex, digit_size)
            ## get_number_digit =(int.from_bytes(resHex,"big"))
            return json.dumps(get_number_digit)

        if type == 'short_string':
            get_short_string = byte_array_to_short_str(resHex, digit_size)
            ##strdata = base64.b64encode(resHex)
            ##get_short_string = strdata.decode('ascii')        
            return (get_short_string)

        if type == 'bytes':
            get_AES = str(resHex)
            return (get_AES)
    except:
        res = "Excute Extractor"
        return res

def kms_hex(size):
    data = request.get_json()
    # exdate_val = (item['expire_date'] for item in rval)
    # expire_date=next(exdate_val)
    # now = datetime.now()
    # exdate =datetime.strptime(expire_date,"%Y-%m-%d %H:%M:%S")

    # date_diff = exdate-now
    # cut_date = str(date_diff)[0:1]
    # if cut_date =='-' :
    #     return ("KEY EXPIRED")
    temp_size = int((int(size) + 1) / 2)

    temp_hex_string  = get_hex_string_by_size(temp_size)

    r_string = temp_hex_string[:int(size)] 
    # string 을 size 갯수 만큼 앞에서 자름

    # 원래 사이즈가 홀수인 경우만 1개가 넘쳐서 그것을 잘라 보냄


    return json.dumps(r_string)
 

def kms_uuid():
    global pzl
    data = request.get_json()
   
    if len(pzl)<(int(32)):
        change = rd.lpop('data')
        change2 = rd.lpop('data')
        zlcf = rd.get(change)
        eclf = rd.get(change2)

        pzl = bytes(itertools.chain(*zip(zlcf,eclf)))

    resHex =(pzl[0:(int(32))])
    pzl = pzl[(int(32)):len(pzl)]

    get_hex_uuid = build_uuid_type(str(resHex[0:4].hex()),str(resHex[4:6].hex()),str(resHex[6:8].hex()),str(resHex[8:10].hex()),str(resHex[10:16].hex()))
    return (get_hex_uuid)


def get_hex_string_by_size(size):
    global pzl
    if len(pzl)<(int(size)):
        change = rd.lpop('data')
        change2 = rd.lpop('data')
        zlcf = rd.get(change)
        eclf = rd.get(change2)

        pzl = bytes(itertools.chain(*zip(zlcf,eclf)))

    resHex =(pzl[0:(int(size))])
    pzl = pzl[(int(size)):len(pzl)]

    get_hex_digit =str(resHex.hex())

    return get_hex_digit
    
def byte_array_to_short_str(barray, size):
 
    tint = byte_array_to_int(barray)
    tarr_len = len(barray)
    tshift_count = int(tarr_len * 8 / 6)
    result_str = ""
    for i in range(0, tshift_count):
        v = tint & 63
        tint = tint >> 6
        result_str = result_str + get_short_char(v)

    result_str = result_str[:size]

    return result_str

def byte_array_to_int(barray):
    arr_len = len(barray)
    multi = 1
    sum = 0
    for i in range(0, arr_len):
        sum = sum + barray[i] * multi
        multi = multi * 256
    return sum

def get_short_char(v):    
    if v < 10:
        return str(v)
    if v < 36: # 앞의 10 이후의 
        base_A = 65 ## ord('A') 
        ch = v - 10 + base_A
        return chr(ch)
    if v < 62: # 앞의 36 이후의
        base_a = 97 ## ord('a')
        ch = v - 36 + base_a
        return chr(ch)
    if v == 62:
        return '#'
    if v == 63:
        return '@'

def byte_array_to_int_str(barray, size):
    # print('raw size ', len(barray))
    result_str = str(byte_array_to_int(barray))
    result_str = result_str[:size]
    # print('result str : ', result_str)
    return result_str


def get_byte_num_from_digit_size(size):
    rval = int(float(size) / 2.41) + int(1) ## 자릿수가 잘릴 수 있으므로 최소값 1을 추가
    return rval

def get_byte_num_from_short_string_size(size):
    rval = int(float(size) / 1.34) + int(1) ## 자릿수가 잘릴 수 있으므로 최소값 1을 추가curl 'https://bootstrap.pypa.io/get-pip.py' > get-pip.py && sudo python get-pip.py
    return rval
