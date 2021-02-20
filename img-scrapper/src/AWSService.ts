import AWS from "aws-sdk";
import {config} from "./config";
import {Logger} from './LoggerService';
import {SentryService} from "./SentryService";
import {KafkaService} from "./KafkaService";

export class AWSService {

    private log;
    private sentry;
    private kafka;

    constructor() {
        AWS.config.update({
            accessKeyId: config.AccessKey,
            secretAccessKey: config.SecretKey,
            region: config.AWSRegion
        });

        this.log = new Logger();
        this.sentry = new SentryService();
        this.kafka = new KafkaService();
    }

    putImageToS3 = async (fileName: string, response: any) => {
        const s3 = new AWS.S3();
        const params = {
            Bucket: `${config.S3Bucket}`,
            Key: fileName,
            Body: response.data,
            ContentType: response.headers['content-type'],
            ContentLength: response.headers['content-length'],
            // ACL: 'public-read'
        }

        s3.putObject(params, (err, data) => {
            if (err) {
                this.log.send('error', {msg: 'Error storing image', fileName, bucket: config.S3Bucket, err});
                this.sentry.captureException(err);
                return {status: false, msg: `Error storing image. Error: ${err}`};
            } else {
                this.kafka.produce(fileName, {});
            }
        });

        this.log.send('info', {msg: 'Image Uploaded', fileName, bucket: config.S3Bucket});
        return {status: true, msg: `Image Uploaded`};
    }
}