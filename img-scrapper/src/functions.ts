import axios from  'axios';
import AWS from 'aws-sdk';
import {Kafka} from 'kafkajs';
import {config} from './config';
import {Logger} from './logs';

const log = new Logger();

export class imgScrapper {

    pathUrl: string;
    totalCameras: number;
    cameraList: string[];

    constructor() {
        this.pathUrl = 'http://www.malaga.eu/recursos/movilidad/camaras_trafico/TV-';
        this.totalCameras = 99;
        this.cameraList = ['02', '05', '06', '07', '09', '10'];
    }

    scrape = async () => {
        log.send('info', {
            msg:'Scrapping Started',
            cameraList: this.cameraList,
            pathUrl: this.pathUrl,
            totalCameras: this.totalCameras
        });

        let res: { msg: string; status: boolean };
        res = {msg: 'OK', status: true};
        let cameraNumber = 1;
        do {
            let cameraName = getCameraName(cameraNumber);
            let url = `${this.pathUrl}${cameraName}.jpg?dummy=${Date.now()}`;
            let imgName = `${Date.now()}-${cameraName}`;

            if(this.cameraList.includes(cameraName)) {
                res = await downloadImage(url, imgName);
            }

            cameraNumber += 1;
        } while(cameraNumber <= this.totalCameras && res.status);

        log.send('info', {
            msg: 'Scrapping Ended',
            cameraList: this.cameraList,
            pathUrl: this.pathUrl,
            totalCameras: this.totalCameras
        });

        return res;
    }
}

const getCameraName = (cameraNumber: number) => {
    return (cameraNumber.toString().length === 1) ? '0' + cameraNumber : cameraNumber.toString();
}

const downloadImage = async (url: string, imgName: string) => {
    let res: { msg: string; status: boolean };

    res = await axios({url: url, method: 'GET', responseType: 'stream'})
        .then(async(response) => {
            log.send('info', {msg: 'Image Downloaded', url, imgName});
            return await putImageToS3(imgName, response);
        })
        .catch(err => {
            log.send('error', {msg: 'Image Download Failed', url, imgName, err});
            return {status: false, msg: `Error downloading image. Error: ${err}`};
        });

    return res;
}

const putImageToS3 = async (fileName: string, response: any) => {
    AWS.config.update({
        accessKeyId: config.AccessKey,
        secretAccessKey: config.SecretKey,
        region: config.AWSRegion
    });

    const s3 = new AWS.S3();
    const params = {
        Bucket: `${config.S3Bucket}`,
        Key: fileName,
        Body: response.data,
        ContentType: response.headers['content-type'],
        ContentLength: response.headers['content-length'],
        // ACL: 'public-read'
    }

    await s3.putObject(params, (err, data) => {
        if (err) {
            log.send('error', {msg: 'Error storing image', fileName, bucket: config.S3Bucket, err});
            return {status: false, msg: `Error storing image. Error: ${err}`};
        }
    });

    log.send('info', {msg: 'Image Uploaded', fileName, bucket: config.S3Bucket});
    return {status: true, msg: `Image Uploaded`};
}

const sendEventToKafka = async () => {
    const kafka = new Kafka({
        clientId: 'my-app',
        brokers: ['kafka1:9092', 'kafka2:9092']
    });

    const producer = kafka.producer();

    await producer.connect();

    await producer.send({
        topic: 'images',
        messages: [
            { value: 'Hello KafkaJS user!' },
        ],
    });

    await producer.disconnect();
}