from flask import Flask, request
import pprint
from pymongo import MongoClient
import os

# dbconnect = "mongodb://localhost:27017/"
dbconnect = os.environ.get("MONGO", os.environ.get(''))
client = MongoClient(dbconnect)

db = client['test']
app = Flask(__name__)
qdb = db.quardianDB
quardianDeleteLog = db.quardianDeleteLog
def find_one():
    pprint.pprint(qdb.find_one())

def find_all():
    #전체 발급된 키 리스트
    #key_list = list(qdb.find({}, {'_id':0, "issue_date": 1, "key_type":1, "key_size":1}))
    #for res in qdb.find():
    #    pprint.pprint(res)
    #List comprehension version
    key_list = [i for i in qdb.find({'sort_by':"key"}, {'_id':0, 'key_data':0, 'expire_date':0})]
    #pprint.pprint(key_list)
    key_log_list = [i for i in qdb.find({'log_type':"create_key"}, {'_id':0, 'key_data':0, 'expire_date':0})]
        
    return key_list, key_log_list

""" 
intput_start = input('input start date : ex)0000-00-00 00:00:00' )
intput_end = input('input end date : ex)0000-00-00 00:00:00' )
"""
#날짜 기간 발급 키 리스트
def find_with_date(date):
    start_date = date['start_date']
    end_date = date['end_date']

    #해당 기간 발급된 키 리스트 출력(key_data 출력 X)
    #result = list(qdb.find({ "issue_date": { '$gt':start_date, '$lt':end_date } }, {'_id':0, 'key_data':0}))
    #List comprehension version
    key_list = [i for i in qdb.find({'$and':[{'sort_by':"key"},{ "issue_date": { '$gt':start_date, '$lt':end_date }}] }, {'_id':0, 'key_data':0, 'expire_date':0})]
    key_list_log = [i for i in qdb.find({'$and':[{'log_type':"create_key"},{ "issue_date": { '$gt':start_date, '$lt':end_date }}] },  {'_id':0, 'key_data':0, 'expire_date':0})]
    
    return key_list, key_list_log


#특정 날짜 발급된 키 리스트
def find_one_day(date):
    one_date = date['date']
    #one_date = '2023-02-03'
    key_list = [i for i in qdb.find({'$and':[{'sort_by':"key"},{ 'issue_date':{'$regex': one_date} }]}, {'_id':0, 'key_data':0, 'expire_date':0})]
    key_list_log = [i for i in qdb.find({'$and':[{'log_type':"create_key"},{ 'issue_date':{'$regex': one_date} }]}, {'_id':0, 'key_data':0, 'expire_date':0})]

    return key_list, key_list_log


#전체 발급된 키 개수
def cnt_all():
    try:
        data = request.headers
        token = data['Authorization']
    except:
         return ({'msg':'Authorization Error'}),401
    if  token== 'Bearer c29728415d7b':
        count_keys = qdb.count_documents({'sort_by':'key'})
        count_keys_log = qdb.count_documents({'log_type':"create_key"})
    else :
        return ({'msg':'Authorization Error'}),401
    return count_keys, count_keys_log

def cnt_log_all():
    try:
        data = request.headers
        token = data['Authorization']
    except:
         return ({'msg':'Authorization Error'}),401
    if  token== 'Bearer c29728415d7b':
        count_keys = qdb.count_documents({'log_type':"create_key"})
    #pprint.pprint("전체 발급 개수 : "+str(count_keys))
    else :
        return ({'msg':'Authorization Error'}),401
    return count_keys

#기간 조건 활용한 발급된 키 개수
def cnt_with_period(date):
    try:
        data = request.headers
        token = data['Authorization']
    except:
         return ({'msg':'Authorization Error'}),401
    if  token== 'Bearer c29728415d7b':
    #데이터 분할
        try:
            start_date = date['start_date']
            end_date = date['end_date']
            count = qdb.count_documents({'$and':[{'sort_by':"key"},{"issue_date": {'$gt':start_date, '$lt':end_date }}]})
            count_log = qdb.count_documents({'$and':[{'log_type':"create_key"},{"issue_date": { '$gt':start_date, '$lt':end_date }}]})            
        except:
            return ({'msg':'Date Type Error'}),400
    else :
        return ({'msg':'Authorization Error'}),401
    #pprint.pprint("기간내 발급 개수 : "+str(count))
    return count, count_log

#특정 날짜 키 개수 조회
def cnt_day(date):
    try:
        data = request.headers
        token = data['Authorization']
    except:
         return ({'msg':'Authorization Error'}),401
    if  token== 'Bearer c29728415d7b':
        try:
            one_date = date['date']
            count = qdb.count_documents({'$and':[{'sort_by':"key"},{'issue_date':{'$regex': one_date}}]})
            count_log = qdb.count_documents({'$and':[{'log_type':"create_key"},{'issue_date':{'$regex': one_date}}]})
        except:
            return ({'msg':'Date Type Error'}),400
    else :
        return ({'msg':'Authorization Error'}),401
    return count, count_log

################################################################################

def deleted_cnt_all():
    try:
        data = request.headers
        token = data['Authorization']
    except:
         return ({'msg':'Authorization Error'}),401
    if  token== 'Bearer c29728415d7b':
        count_keys = quardianDeleteLog.count_documents({})
    #pprint.pprint("전체 발급 개수 : "+str(count_keys))
    else :
        return ({'msg':'Authorization Error'}),401
    return count_keys

#기간 조건 활용한 발급된 키 개수
def deleted_cnt_with_period(date):
    try:
        data = request.headers
        token = data['Authorization']
    except:
         return ({'msg':'Authorization Error'}),401
    if  token== 'Bearer c29728415d7b':
    #데이터 분할
        try:
            start_date = date['start_date']
            end_date = date['end_date']
            count = quardianDeleteLog.count_documents({"issue_date": { '$gt':start_date, '$lt':end_date }})
        except:
            return ({'msg':'Date Type Error'}),400
    else :
        return ({'msg':'Authorization Error'}),401
    #pprint.pprint("기간내 발급 개수 : "+str(count))
    return count

#특정 날짜 키 개수 조회
def deleted_cnt_day(date):
    try:
        data = request.headers
        token = data['Authorization']
    except:
         return ({'msg':'Authorization Error'}),401
    if  token== 'Bearer c29728415d7b':
        try:
            one_date = date['date']
            count = quardianDeleteLog.count_documents({'issue_date':{'$regex': one_date}})
        except:
            return ({'msg':'Date Type Error'}),400
    else :
        return ({'msg':'Authorization Error'}),401
    return count

def deleted_with_date(date):
    one_date = date['date']
    key_list = [i for i in quardianDeleteLog.find({ 'issue_date':{'$regex': one_date} }, {'_id':0, 'key_data':0, 'expire_date':0})]

    return key_list

def deleted_with_period(date):
    start_date = date['start_date']
    end_date = date['end_date']
    key_list = [i for i in quardianDeleteLog.find({ "issue_date": { '$gt':start_date, '$lt':end_date } }, {'_id':0, 'key_data':0, 'expire_date':0})]
    
    return key_list

if __name__ == "__main__":
    #date_count()
    find_one_day()






""" def date_count():
    #날짜별 카운트
    count2 = list(qdb.aggregate([{"$project":
                                   { "issue_date": 
                                    { "$dateToString": 
                                     {"format":"%Y-%m-%d %H:%M:%S", "date":"$registration_date"}} } },
                               {"$group":{"_id":"$issue_date", "count":{"$sum":1}}}]))

    count3 = list(qdb.aggregate([
                    {"$group": {
                        "_id": {
                            "interval": {
                                "$subtract": [
                                    { "$year": '$DATE'}, 
                                    { "$mod": [{ "$year": "$DATE"}, 2]} 
                                ]
                            }
                        },
                        "count": { "$sum": 1}
                    }},
                    {"$sort": { "_id": 1 } }]))
    pprint.pprint(count2) """