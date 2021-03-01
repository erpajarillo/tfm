import axios from 'axios';
import {AWSService} from "./services/AWSService";
import {KafkaService} from "./services/KafkaService";
import {downloadImageInterface, scrapeResponseInterface} from "./interfaces/Interfaces";

export class imgScrapper {
    private readonly pathUrl: string;
    private readonly totalCameras: number;
    // private readonly cameraList: string[];
    private aws;
    private kafka;

    constructor() {
        this.pathUrl = 'http://www.malaga.eu/recursos/movilidad/camaras_trafico/TV-';
        this.totalCameras = 99;
        // this.cameraList = ['02', '05', '06', '07', '09', '10'];
        this.aws = new AWSService();
        this.kafka = new KafkaService();
    }

    scrape = async () : Promise<scrapeResponseInterface> => {
        let res = <scrapeResponseInterface> {msg: 'OK', status: true};
        let cameraNumber = 1;

        console.log('info', {
            msg:'Scrapping Started',
            // cameraList: this.cameraList,
            pathUrl: this.pathUrl,
            totalCameras: this.totalCameras
        });

        do {
            let cameraName = this.getCameraName(cameraNumber);
            let url = `${this.pathUrl}${cameraName}.jpg?dummy=${Date.now()}`;
            let imgName = `${Date.now()}-${cameraName}`;

            // if(this.cameraList.includes(cameraName)) {
                const responseDownloadImage = await this.downloadImage(url);
                if (responseDownloadImage.status) {
                    const responseStoreImage = await this.aws.storeImage(imgName, responseDownloadImage.image);
                    if(responseStoreImage.status) {
                        await this.kafka.produce(imgName, {
                            url: url,
                            cameraName: cameraName
                        });
                        console.log(`Kafka Data sent at ${Date.now()}`);
                        console.log({url: url, cameraName: cameraName});
                    }
                }
            // }

            cameraNumber += 1;
            setTimeout(() => {}, 1000);
        } while(cameraNumber <= this.totalCameras);

        console.log('info', {
            msg: 'Scrapping Ended',
            // cameraList: this.cameraList,
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
                if(response.headers.hasOwnProperty('expires')) {
                    console.log('info', {msg: 'Image Downloaded', url});
                    return {status: true, msg: 'Image Downloaded', image: response};
                } else {
                    console.log('info', {msg: 'Image Not Downloaded', url});
                    return {status: false, msg: `Error downloading image. Error: Not an image`, image: null};
                }
            })
            .catch(err => {
                console.log('error', {msg: 'Image Download Failed', url, err});

                return {status: false, msg: `Error downloading image. Error: ${err}`, image: null};
            });
    }
}

