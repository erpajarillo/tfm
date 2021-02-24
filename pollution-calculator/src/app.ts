import serverless from 'serverless-http';
import express from 'express';
import bodyParser from 'body-parser';
import {pollutionCalculator} from './functions';
import * as Sentry from "@sentry/serverless";
import {config} from "./config";

Sentry.AWSLambda.init({
    dsn: config.SentryDNS,
    environment: config.AppEnv,
    tracesSampleRate: 1.0,
});

const pollCall = new pollutionCalculator();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/pollution', async (req, res) => {
    const response = await pollCall.calculate();
    res.status(200).json(response);
});

const port = 3000;
app.listen(port, () => {
    console.log("Listening port: " + port);
});

// exports.lambdaHandler = Sentry.AWSLambda.wrapHandler(serverless(app), {
//     captureTimeoutWarning: false
// });