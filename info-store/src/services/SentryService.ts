import * as Sentry from "@sentry/serverless";
import {config} from "../config";
import {ExceptionServiceInterface} from "../interfaces/Interfaces";

export class SentryService implements ExceptionServiceInterface{
    constructor() {
        Sentry.AWSLambda.init({
            dsn: config.SentryDNS,
            environment: config.AppEnv,
            tracesSampleRate: 1.0,
        });
    }

    captureException = (err: any) => {
        Sentry.captureException(err);
    }
}