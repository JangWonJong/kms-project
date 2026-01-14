import redis
import itertools
import json
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient, ASCENDING, DESCENDING
import os
from flask import request, make_response, jsonify

rd = redis.StrictRedis(host='localhost', port=6379, db=0)

from kms_service import get_byte_num_from_digit_size, get_byte_num_from_short_string_size,byte_array_to_int_str, byte_array_to_short_str

################# DB Setting #################################
dbconnect = os.environ.get("MONGO", os.environ.get(''))
#dbconnect = "mongodb://WJ:qpdltmtmxhs8048!!@localhost:27017/"
client = MongoClient(dbconnect)
qdb = client['test']
qkDB = qdb.qkDB

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



def kms_keys(type,size):
    
        global pzl
    
        
        digit_size = int(size)
        if type == 'digit':
            size = get_byte_num_from_digit_size(size)

        if type == 'short_string':
            size = get_byte_num_from_short_string_size(size)
        print(len(pzl))
        if len(pzl)<(int(size)):
            change = rd.lpop('data')
            change2 = rd.lpop('data')
            zlcf = rd.get(change)
            eclf = rd.get(change2)


            pzl = bytes(itertools.chain(*zip(zlcf,eclf)))
        print(len(pzl))

        print("3",size)
        resHex =(pzl[0:(int(size))])
        print(resHex)
        print("len",len(resHex))
        pzl = pzl[(int(size)):len(pzl)]
        print('PZLEN',len(pzl))
        if type == 'digit':
            print("RES",resHex)
            print(len(resHex))
            get_number_digit = byte_array_to_int_str(resHex, digit_size)
            print("RES",get_number_digit)

            print(digit_size)
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


def test():



    key_name = "str"
    ls = qkDB.find_one({"key_name": key_name})
    val = ls['key_name']
    s = val.get()
    print("1",ls)
    print("2",val)
    print("3",s)
    if key_name in ls:
        key_name = qkDB.find_one({"key_name" : key_name})['key_name']
        test = key_name.get()
        print(test)

    print(key_name)


def gtest():
    my_dict = {'key1': 'value1', 'key2': 'value2'}
    value = my_dict.get('key3', '기본값')
    print(value)
    key_name = "str"
    ls = qkDB.find_one({"key_name" : key_name})
    print(ls)
    if ls is None:
        print("insert")    
    else:
        print("ant")
    # 또는
    # if 'key3' in my_dict:
    # value = my_dict['key3']
    # value.get()



if __name__ == "__main__":
    #kms_keys(size=64, type="digit")
    gtest()