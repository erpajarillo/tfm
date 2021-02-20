import winston from 'winston';
import {config} from "./config";
const {Loggly} = require('winston-loggly-bulk');

export class Logger {

    private readonly appName;

    constructor() {
        winston.add(new Loggly({
            token: config.LogglyKey,
            subdomain: config.LogglySubdomain,
            tags: ["Winston-NodeJS"],
            json: true
        }));

        this.appName = 'img-scrapper';
    }

    send = (type: string, content: object) => {
        winston.log(type, `[${this.appName}] ${content}`);
    }
}