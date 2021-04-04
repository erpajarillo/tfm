import sys
from yolo import YOLO, detect_video
import boto3
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
from kafka import KafkaConsumer, KafkaProducer
from dotenv import load_dotenv
import os

load_dotenv()
KAKFA_BROKER = os.getenv("KafkaBroker")
KAFKA_CLIENT = os.getenv("KafkaClient")
KAFKA_DETECTIONS_TOPIC = os.getenv("KafkaDetectionsTopic")
KAFKA_IMAGES_TOPIC = os.getenv("KafkaImagesTopic")
S3_BUCKET = os.getenv("S3Bucket")

def bytes_to_ndarray(bytes):
    bytes_io = bytearray(bytes)
    img = Image.open(BytesIO(bytes_io))
    return np.array(img)


def detect_img(yolo):
    consumer = KafkaConsumer(KAFKA_IMAGES_TOPIC, group_id='detect-group', bootstrap_servers=[KAKFA_BROKER])
    for msg in consumer:
        try:
            s3 = boto3.resource('s3')
            bucket = s3.Bucket(S3_BUCKET)
            print(msg.value.decode('UTF-8'))
            file_content = bucket.Object(msg.value.decode('UTF-8')).get()['Body'].read()

            np_array = np.frombuffer(file_content, np.uint8)
            image_np = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
            _, bytes = cv2.imencode('.png', image_np)
            img_byte_pil = bytes_to_ndarray(bytes)
            image = Image.fromarray(img_byte_pil)

            # Mostrar imagen o datos
            r_image = yolo.detect_image(image)
            # r_image.show()

            # Preparar datos para enviar a Kafka
            total = r_image['car'] + r_image['truck'] + r_image['bus'] + r_image['motorbike']
            producer = KafkaProducer(bootstrap_servers=[KAKFA_BROKER])
            producer.send(KAFKA_DETECTIONS_TOPIC, key=b'total', value=b'%d' % total,
                          headers=[
                              ('imgName', msg.value),
                              (msg.headers[0][0], msg.headers[0][1]),
                              (msg.headers[1][0], msg.headers[1][1]),
                              ('totalVehicles', b'%d' % total),
                              ('totalCars', b'%d' % r_image['car']),
                              ('totalTrucks', b'%d' % r_image['truck']),
                              ('totalBuses', b'%d' % r_image['bus']),
                              ('totalMotorbikes', b'%d' % r_image['motorbike']),
                          ])
        except:
            e = sys.exc_info()[0]
            print(e)

    yolo.close_session()


if __name__ == '__main__':
    detect_img(YOLO())
