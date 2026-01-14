import redis
import time

global bNum,dNum
bNum = 1
dNum = 1
rd = redis.StrictRedis(host='localhost', port=6379, db=0)

def readTest():
    global bNum,dNum
    if rd.llen('data') <4 : 
     #with open("v2.1-nrbg-"+str(bNum)+".bin","rb") as f:
     with open("v2.1-nrbg-1.bin","rb") as f:   
        data = f.read()
        for i in range(10):
            rd.rpush('data','data'+str(dNum))
            res = data[int(len(data)*(i/10)):int(len(data)*((i+1)/10))]
            rd.set('data'+str(dNum),res)
            dNum = dNum+1
        bNum = bNum+1
    

while 1:
    time.sleep(1)
    readTest()