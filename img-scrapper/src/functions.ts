import axios from  'axios';
import AWS from 'aws-sdk';
import {config} from './config';

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

        return res;
    }
}

const getCameraName = (cameraNumber: number) => {
    return (cameraNumber.toString().length === 1) ? '0' + cameraNumber : cameraNumber.toString();
}

const downloadImage = async (url: string, imgName: string) => {
    let res: { msg: string; status: boolean };
    console.log(url);
    res = await axios({url: url, method: 'GET', responseType: 'stream'})
        .then(async(response) => {
            return await putImageToS3(imgName, response);
        })
        .catch(err => {
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
        Bucket : 'images-tfm',
        Key : fileName,
        Body : response.data,
        ContentType: response.headers['content-type'],
        ContentLength: response.headers['content-length'],
        // ACL: 'public-read'
    }

    s3.putObject(params, (err, data) => {
        if (err) {
            return {status: false, msg: `Error storing image. Error: ${err}`};
        }
    });

    return {status: true, msg: `Image Uploaded`};
}