import * as Sentry from "@sentry/serverless";
import {config} from "./config";

export class SentryService {
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