import redis
import itertools
import json
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient, ASCENDING, DESCENDING
from flask import request
import os


host = "localhost"
port = 9123
#dbconnect = "mongodb://WJ:qpdltmtmxhs8048!!@localhost:27017/"
dbconnect = os.environ.get("MONGO", os.environ.get(''))
client = MongoClient(dbconnect)
db = client['test']

#client = MongoClient("mongodb://localhost:27017/")
#db = client['test']
qdb = db.quardianDB
qdblog = db.quardianLOG
qdbDeleteLog = db.quardianDeleteLog

rd = redis.StrictRedis(host='localhost', port=6379, db=0)

qdb.create_index([(i, DESCENDING) for i in ['issue_date']])

db.bearer_token.create_index([(i, DESCENDING) for i in ['token']])


#지정 시간 후 삭제(2가지 방법) 30초 설정
#qdb.create_index([(i, ASCENDING) for i in ['expiredate']], name ='expireindex', expireAfterSeconds=10)   
#qdb.create_index('expire_date', name ='expireindex', expireAfterSeconds=86400*180)
# 해당 날짜 이후 삭제(날짜 지정 -> "UTC" 기준으로 설정해야함)
qdb.create_index('expire_date', name ='expireindex', expireAfterSeconds=0)
qdb.create_index('expire_log_date', name ='expire_log_index', expireAfterSeconds=3600)
# UTC 변환
# kst = timezone(timedelta(hours=9))
# 만료날짜 설정
# sdate = ''
# date = datetime.strptime(sdate, "%Y-%m-%d %H:%M").replace(tzinfo=timezone(timedelta(hours=9)))
# date = datetime(2023,2,7,16,15,00, tzinfo= kst or timezone(timedelta(hours=9)))
#  
#       data ={
#            '_id_': resHex,
#            'key_size':int(size),
#            'key_type':'bytes',
#            'issue_date' : issueDate,
#            'expire_date': date
#        }

#qdb.insert_one(data)
#UTC Convert 
kst = timezone(timedelta(hours=9))

#Bearer Token Value
#bearer_token = (db.bearer_token.find_one({},{'_id':0,'token':1}))
bearer_token = [i for i in db.bearer_token.find({'token':{'$regex':'Bearer'}},{'_id':0, 'key':0})]

date_convert = datetime.now() + timedelta(hours=1)
kst_expire_log = date_convert.strftime("%Y-%m-%d %H:%M")
log_ttl = date_convert.replace(tzinfo=timezone(timedelta(hours=9)))


pzl = ()
def redis_reload():
    global pzl
    upr = rd.lpop('data')
    amn = rd.lpop('data')
    zlc = rd.get(upr)
    ecl = rd.get(amn)
    pzl = bytes(itertools.chain(*zip(zlc,ecl)))
redis_reload()

def save_tokenmg(size):
    mg_token = create_token(size)
    token_data = {
        'token' : mg_token
    }
    db.bearer_token.insert_one(token_data)
    return mg_token

def delete_tokenmg():
        data = request.headers
        token = data['Authorization']
        db.bearer_token.delete_one({'token':{'$regex':data['Authorization']}})
        return token


#수정작업중(MongoDB ver)
def bytes_df(size):
    global pzl
    if len(pzl)<(int(size)):
       change = rd.lpop('data')
       change2 = rd.lpop('data')
       zlcf = rd.get(change)
       eclf = rd.get(change2)
       pzl = bytes(itertools.chain(*zip(zlcf,eclf)))

    req_expire_date = request.get_json()
    sdate = req_expire_date["expire_date"]
    issueDate = datetime.now().strftime("%Y-%m-%d %H:%M")
    data = request.headers
    token = {'token':data['Authorization']}

    ttl_date = datetime.strptime(sdate, "%Y-%m-%d %H:%M").replace(tzinfo=timezone(timedelta(hours=9)))
    #bearer_token =db.bearer_token.find_one({},{'_id':0,'token':1})
    #bearer_token =list(db.bearer_token.find({'key':{'$all':['token']}},{'_id':0, 'key':0}))
    #bearer_token =[i for i in db.bearer_token.find({'key':{'$all':['token']}},{'_id':0, 'key':0})]

    #bearer_token = [i for i in db.bearer_token.find({'token':{'$regex':'Bearer'}},{'_id':0, 'key':0})]
    print(token)
    print(bearer_token)
    
    if token in bearer_token:
        resHex =(pzl[0:(int(size))])
        pzl = pzl[(int(size)):len(pzl)]
        get_AES=str(resHex)
        
        data ={
            '_id': get_AES,
            'key_size':int(size),
            'key_type':'Bytes',
            'issue_date' : issueDate,
            'expire_date': ttl_date,
            'kst_expire_date' : sdate,
        }
        logdata ={
            'key_data': get_AES,
            'key_size':int(size),
            'key_type':'Bytes',
            'issue_date' : issueDate,
            'expire_log_date' : log_ttl,
            'kst_expire_date' : kst_expire_log
        }
        qdb.insert_many([data])
        qdblog.insert_many([logdata])
    else :
        get_AES="Failed"
    return get_AES

def hex_df(size):
    global pzl
    if len(pzl)<(int(size)):
       change = rd.lpop('data')
       change2 = rd.lpop('data')
       zlcf = rd.get(change)
       eclf = rd.get(change2)

       pzl = bytes(itertools.chain(*zip(zlcf,eclf)))
    
    issueDate = datetime.now().strftime("%Y-%m-%d %H:%M")
    req_expire_date = request.get_json()
    sdate = req_expire_date["expire_date"]
    ttl_date = datetime.strptime(sdate, "%Y-%m-%d %H:%M").replace(tzinfo=timezone(timedelta(hours=9)))
    data = request.headers
    token = {'token':data['Authorization']}

    
    if token in bearer_token:
        temp_size = int((int(size) + 1) / 2)
        temp_hex_string  = get_hex_string_by_size(temp_size)
        r_string = temp_hex_string[:int(size)] 
        get_AES = r_string
        data ={
            '_id': get_AES,
            'key_size':int(size),
            'key_type':'Hex',
            'issue_date' : issueDate,
            'expire_date': ttl_date,
            'kst_expire_date' : sdate,
        }
        logdata ={
            'key_data': get_AES,
            'key_size':int(size),
            'key_type':'Hex',
            'issue_date' : issueDate,
            'expire_log_date': log_ttl,
            'kst_expire_date' : kst_expire_log
        }
        qdb.insert_many([data, logdata])
    else :
        get_AES="Failed"
    return get_AES

def digit_df(size):
    global pzl
    if len(pzl)<(int(size)):
       change = rd.lpop('data')
       change2 = rd.lpop('data')
       zlcf = rd.get(change)
       eclf = rd.get(change2)

       pzl = bytes(itertools.chain(*zip(zlcf,eclf)))
   
    issueDate = datetime.now().strftime("%Y-%m-%d %H:%M")
    req_expire_date = request.get_json()
    sdate = req_expire_date["expire_date"]
    ttl_date = datetime.strptime(sdate, "%Y-%m-%d %H:%M").replace(tzinfo=timezone(timedelta(hours=9)))
    data = request.headers
    token = {'token':data['Authorization']}


    if token in bearer_token:
        resHex =(pzl[0:(int(size))])
        pzl = pzl[(int(size)):len(pzl)]
        digit_size = int(size)
        size = get_byte_num_from_digit_size(int(size))
        get_number_digit = byte_array_to_int_str(resHex, digit_size)
        get_AES=get_number_digit
        data ={
            '_id': get_AES,
            'key_size':int(size),
            'key_type':'Digit',
            'issue_date' : issueDate,
            'expire_date': ttl_date,
            'kst_expire_date' : sdate
        }
        logdata ={
            'key_data': get_AES,
            'key_size':int(size),
            'key_type':'Digit',
            'issue_date' : issueDate,
            'expire_log_date': log_ttl,
            'kst_expire_date' : kst_expire_log
        }
        qdb.insert_many([data, logdata])
    else :
        get_AES="Failed"
    return get_AES


def short_stringdf(size):
    global pzl
    if len(pzl)<(int(size)):
       change = rd.lpop('data')
       change2 = rd.lpop('data')
       zlcf = rd.get(change)
       eclf = rd.get(change2)

       pzl = bytes(itertools.chain(*zip(zlcf,eclf)))
    
    issueDate = datetime.now().strftime("%Y-%m-%d %H:%M")
    req_expire_date = request.get_json()
    sdate = req_expire_date["expire_date"]
    ttl_date = datetime.strptime(sdate, "%Y-%m-%d %H:%M").replace(tzinfo=timezone(timedelta(hours=9)))
    data = request.headers
    token = {'token':data['Authorization']}


    if token in bearer_token:
        resHex =(pzl[0:(int(size))])
        pzl = pzl[(int(size)):len(pzl)]
        digit_size = int(size)
        size = get_byte_num_from_digit_size(size)
        get_short_string = byte_array_to_short_str(resHex, digit_size)
        get_AES=get_short_string
        data ={
            '_id': get_AES,
            'key_size':int(size),
            'key_type':'Short-string',
            'issue_date' : issueDate,
            'expire_date': ttl_date,
            'kst_expire_date' : sdate
        }
        logdata ={
            'key_data': get_AES,
            'key_size':int(size),
            'key_type':'Short-string',
            'issue_date' : issueDate,
            'expire_log_date': log_ttl,
            'kst_expire_date' : kst_expire_log
        }
        qdb.insert_many([data, logdata])
    else :
        get_AES="Failed"
    return get_AES

def uuid_df():
    global pzl
    if len(pzl)<(int(32)):
        change = rd.lpop('data')
        change2 = rd.lpop('data')
        zlcf = rd.get(change)
        eclf = rd.get(change2)

        pzl = bytes(itertools.chain(*zip(zlcf,eclf)))

    issueDate = datetime.now().strftime("%Y-%m-%d %H:%M")
    req_expire_date = request.get_json()
    sdate = req_expire_date["expire_date"]
    ttl_date = datetime.strptime(sdate, "%Y-%m-%d %H:%M").replace(tzinfo=timezone(timedelta(hours=9)))

    data = request.headers
    token = {'token':data['Authorization']}

    resHex =(pzl[0:(int(32))])
    pzl = pzl[(int(32)):len(pzl)]
    get_hex_uuid = build_uuid_type(str(resHex[0:4].hex()),str(resHex[4:6].hex()),str(resHex[6:8].hex()),str(resHex[8:10].hex()),str(resHex[10:16].hex()))


    if token in bearer_token:
        get_AES=get_hex_uuid
        data ={
            '_id': get_AES,
            'key_size': 32,
            'key_type':'UUID',
            'issue_date' : issueDate,
            'expire_date': ttl_date,
            'kst_expire_date' : sdate
        }
        logdata ={
            'key_data': get_AES,
            'key_size': 32,
            'key_type':'UUID',
            'issue_date' : issueDate,
            'expire_log_date': log_ttl,
            'kst_expire_date' : kst_expire_log
        }
        qdb.insert_many([data, logdata])
    else :
        get_AES="Failed"
   
    return get_AES

def searchAPI():
    data = request.get_json()
    key_data = data["key_data"]
    api_list =[]
    for x in qdb.find({"_id":key_data}):
        api_list.append(x)
           
    
    return ({'code':'200','data':api_list})

def delete_api_key():
    data = request.get_json()
    token = {'token':request.headers['Authorization']}

    if token in bearer_token:
        key_data = data["key_data"]
        if(qdb.find_one({"_id":key_data})==None):
            return{'error':'No such Keys'}
        else:
            for_log = qdb.find_one({"_id":key_data})
            for_log['log_type']='delete_key'
            qdbDeleteLog.insert_one(for_log)
            qdb.delete_one({"_id":key_data})
            
            return{'status':"delete success"} 
    else:
            return {"error":"code 404"}
    

def kms_delete_api_key():
    data = request.get_json()
    key_data = data["key_data"]
    qdb.delete_one({"_id":key_data})
        
    return ({'status':'delete success'})



def byte_array_to_int(barray):
    arr_len = len(barray)
    multi = 1
    sum = 0
    for i in range(0, arr_len):
        sum = sum + barray[i] * multi
        multi = multi * 256
    return sum

def byte_array_to_int_str(barray, size):
    # print('raw size ', len(barray))
    result_str = str(byte_array_to_int(barray))
    result_str = result_str[:size]
    # print('result str : ', result_str)
    return result_str


def get_byte_num_from_digit_size(size):
    rval = int(float(size) / 2.41) + int(1) ## 자릿수가 잘릴 수 있으므로 최소값 1을 추가
    return rval

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

def get_byte_num_from_digit_size(size):
    rval = int(float(size) / 2.41) + int(1) ## 자릿수가 잘릴 수 있으므로 최소값 1을 추가
    return rval

def get_byte_num_from_short_string_size(size):
    rval = int(float(size) / 1.34) + int(1) ## 자릿수가 잘릴 수 있으므로 최소값 1을 추가curl 'https://bootstrap.pypa.io/get-pip.py' > get-pip.py && sudo python get-pip.py
    return rval

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

    if type == 'digit':
        get_number_digit = byte_array_to_int_str(resHex, digit_size)
        return json.dumps(get_number_digit)

    if type == 'short_string':
        get_short_string = byte_array_to_short_str(resHex, digit_size)
        return json.dumps(get_short_string)

    if type == 'AES_key':
        get_AES = resHex
        return (get_AES)

    if type == 'AES_nonce':
        get_nonce = resHex
        return (get_nonce)

def build_uuid_type(first,second,third,fourth,fifth):
        arr =[]
        arr.append(first)
        arr.append(second)
        arr.append(third)
        arr.append(fourth)
        arr.append(fifth)
        arr = '-'.join(arr)
        return arr

mycol = db["quardianDB"]

def getNextSequence():
    db.autoInc.update_one(
        {'_id':'userId'},
        update={'$inc':{'seq':1}},
        # fields={'id':1,'_id':0},     
    )
    seq = (db.autoInc.find_one({},{'_id':0,'seq':1}))
    return int(seq.get('seq'))

def mgdbtest(num):
    api_list =[]
    rnum = int(num)
    if rnum ==1:
        
        for x in qdb.find().limit(10000).sort('issue_date',-1):
            api_list.append(x)
         
    if 1 <rnum :

        for x in qdb.find().skip(rnum*10000-10000).limit(10000).sort('issue_date',-1):
            api_list.append(x)
           
    
    return ({'code':'200','data':api_list})

