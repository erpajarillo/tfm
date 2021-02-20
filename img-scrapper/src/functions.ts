import axios from 'axios';
import {Logger} from './services/LoggerService';
import {SentryService} from "./services/SentryService";
import {AWSService} from "./services/AWSService";
import {KafkaService} from "./services/KafkaService";
import {downloadImageInterface, scrapeResponseInterface} from "./interfaces/Interfaces";

export class imgScrapper {
    private readonly pathUrl: string;
    private readonly totalCameras: number;
    private readonly cameraList: string[];
    private log;
    private aws;
    private sentry;
    private kafka;

    constructor() {
        this.pathUrl = 'http://www.malaga.eu/recursos/movilidad/camaras_trafico/TV-';
        this.totalCameras = 99;
        this.cameraList = ['02', '05', '06', '07', '09', '10'];
        this.log = new Logger();
        this.sentry = new SentryService();
        this.aws = new AWSService();
        this.kafka = new KafkaService();
    }

    scrape = async () : Promise<scrapeResponseInterface> => {
        let res = <scrapeResponseInterface> {msg: 'OK', status: true};
        let cameraNumber = 1;

        this.log.send('info', {
            msg:'Scrapping Started',
            cameraList: this.cameraList,
            pathUrl: this.pathUrl,
            totalCameras: this.totalCameras
        });

        do {
            let cameraName = this.getCameraName(cameraNumber);
            let url = `${this.pathUrl}${cameraName}.jpg?dummy=${Date.now()}`;
            let imgName = `${Date.now()}-${cameraName}`;

            if(this.cameraList.includes(cameraName)) {
                const responseDownloadImage = await this.downloadImage(url);
                if (responseDownloadImage.status) {
                    const responseStoreImage = await this.aws.storeImage(imgName, responseDownloadImage.image);
                    if(responseStoreImage.status) {
                        await this.kafka.produce(imgName, {
                            url: url,
                            cameraName: cameraName
                        });
                    }
                }
            }

            cameraNumber += 1;
        } while(cameraNumber <= this.totalCameras);

        this.log.send('info', {
            msg: 'Scrapping Ended',
            cameraList: this.cameraList,
            pathUrl: this.pathUrl,
            totalCameras: this.totalCameras
        });

        return res;
    }

    private getCameraName = (cameraNumber: number) : string => {
        return (cameraNumber.toString().length === 1) ? '0' + cameraNumber : cameraNumber.toString();
    }

    private downloadImage = async (url: string) : Promise<downloadImageInterface> => {
        return await axios({url: url, method: 'GET', responseType: 'stream'})
            .then(async (response) => {
                this.log.send('info', {msg: 'Image Downloaded', url});

                return {status: true, msg: 'Image Downloaded', image: response};
            })
            .catch(err => {
                this.log.send('error', {msg: 'Image Download Failed', url, err});
                this.sentry.captureException(err);

                return {status: false, msg: `Error downloading image. Error: ${err}`, image: null};
            });
    }
}

