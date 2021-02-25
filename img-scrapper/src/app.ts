import serverless from 'serverless-http';
import express from 'express';
import bodyParser from 'body-parser';
import {imgScrapper} from './functions';
import * as Sentry from "@sentry/serverless";
import {config} from "./config";

Sentry.AWSLambda.init({
    dsn: config.SentryDNS,
    environment: config.AppEnv,
    tracesSampleRate: 1.0,
});

const imgScrap = new imgScrapper();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/test', (req, res) => {

});

app.get('/', async (req, res) => {
    const response = await imgScrap.scrape();
    res.status(200).json(response);
});

const port = 3001;
app.listen(port, () => {
    console.log("Listening port: " + port);
});

// exports.lambdaHandler = Sentry.AWSLambda.wrapHandler(serverless(app), {
//     captureTimeoutWarning: false
// });