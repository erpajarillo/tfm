import AWS from "aws-sdk";
import {config} from "../config";
import {Logger} from './LoggerService';
import {SentryService} from "./SentryService";
import {awsResponseInterface, CloudServiceInterface} from "../interfaces/Interfaces";

export class AWSService implements CloudServiceInterface {

    private log;
    private sentry;

    constructor() {
        AWS.config.update({
            accessKeyId: config.AccessKey,
            secretAccessKey: config.SecretKey,
            region: config.AWSRegion
        });

        this.log = new Logger();
        this.sentry = new SentryService();
    }

    storeImage = async (imgName: string, response: any) : Promise<awsResponseInterface> => {
        const s3 = new AWS.S3();
        const params = {
            Bucket: `${config.S3Bucket}`,
            Key: imgName,
            Body: response.data,
            ContentType: response.headers['content-type'],
            ContentLength: response.headers['content-length'],
            // ACL: 'public-read'
        }

        s3.putObject(params, (err, data) => {
            if (err) {
                this.log.send('error', {msg: 'AWS: Error storing image', imgName, bucket: config.S3Bucket, err});
                this.sentry.captureException(err);
                return {status: false, msg: `Error storing image. Error: ${err}`};
            } else {
                this.log.send('info', {msg: 'AWS: Image Uploaded', imgName, data, bucket: config.S3Bucket});
            }
        });

        return {status: true, msg: `Image Uploaded`};
    }
}