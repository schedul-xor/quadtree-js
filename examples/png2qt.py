#!/usr/bin/env python
# -*- coding:utf-8 -*-

import os
import sys
import json
import Image

class QN:
    def __init__(self):
        # |01|
        # |23|
        self.children = []
        self.isBlack = 0

target_img_path = sys.argv[1]
output_qtjson_path = sys.argv[2]

img = Image.open(target_img_path)
pix = img.load()
size = img.size[0]
limitZ = 0
while size > 2**limitZ:
    limitZ = limitZ+1

def checkImgIfBlack(x,y):
    (r,g,b,a) = pix[x,y]
    return r == 0 and g == 0 and b == 0

def lookInsideQn(x,y,z,limitZ):
    qn = QN()
    if limitZ == z:
        qn.isBlack = checkImgIfBlack(x,y)
    else:
        # 0
        qn0 = lookInsideQn(x*2,y*2,z+1,limitZ)
        qn1 = lookInsideQn(x*2+1,y*2,z+1,limitZ)
        qn2 = lookInsideQn(x*2,y*2+1,z+1,limitZ)
        qn3 = lookInsideQn(x*2+1,y*2+1,z+1,limitZ)
        qn.children = [qn0,qn1,qn2,qn3]
        isTrimmable = True
        blackCount = 0
        whiteCount = 0
        for child in qn.children:
            if len(child.children) > 0:
                isTrimmable = False
                break
            else:
                if child.isBlack:
                    blackCount = blackCount+1
                else:
                    whiteCount = whiteCount+1
        if isTrimmable:
            if blackCount == 0:
                qn.isBlack = False
            else:
                qn.isBlack = True
            qn.children = []
        else:
            print 'nc'
    return qn

qnroot = lookInsideQn(0,0,0,limitZ)

def traverseInsideQn(x,y,z,qn,o):
    if len(qn.children) == 0:
        o.append([x,y,z])
    else:
        traverseInsideQn(x*2,y*2,z+1,qn.children[0],o)
        traverseInsideQn(x*2+1,y*2,z+1,qn.children[1],o)
        traverseInsideQn(x*2,y*2+1,z+1,qn.children[2],o)
        traverseInsideQn(x*2+1,y*2+1,z+1,qn.children[3],o)
    return o

j = traverseInsideQn(0,0,0,qnroot,[])

print json.dumps(j)
