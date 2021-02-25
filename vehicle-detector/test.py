import boto3
import cv2
import numpy as np
from yolo import YOLO, detect_video
from PIL import Image
import PIL
from io import StringIO
from io import BytesIO
from kafka import KafkaConsumer

consumer = KafkaConsumer('images', group_id='detect-group', bootstrap_servers=['54.195.132.108:9092'])
for msg in consumer:
    print(msg.headers[0][0])
    print(msg.headers[0][1].decode('UTF-8'))
    print(msg.headers[1][0])
    print(msg.headers[1][1].decode('UTF-8'))
    print(msg.value.decode('UTF-8'))



# def bytes_to_ndarray(bytes):
#     bytes_io = bytearray(bytes)
#     img = Image.open(BytesIO(bytes_io))
#     return np.array(img)
#
# s3 = boto3.resource('s3')
# bucket = s3.Bucket('images-tfm')
# file_content = bucket.Object('1613918233132-05').get()['Body'].read()
# print(type(file_content))
#
# # image_array = Image.frombytes("RGB", (100, 100), file_content, "raw")
# np_array = np.frombuffer(file_content, np.uint8)
# image_np = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
#
# _, bytes = cv2.imencode('.png', image_np)
# img_byte_pil = bytes_to_ndarray(bytes)
# im = Image.fromarray(img_byte_pil)
# print(type(im))
#
#
# # image = cv2.imread(image_np, cv2.IMREAD_COLOR)
#
# # a = np.asarray(np_array)
# # im = Image.fromarray(a)
#
# # image = Image.frombuffer(data=file_content, size=(100, 100), mode='RGB')
# # image_from_array = Image.fromarray(image_array)
#
# open_cv_image = np.array(im)
#
# cv2.imshow('Car Detection System', open_cv_image)
# cv2.waitKey(0)
