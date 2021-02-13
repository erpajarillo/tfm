import serverless from 'serverless-http';
import express from 'express';
import bodyParser from 'body-parser';
import {imgScrapper} from './functions';

const imgScrap = new imgScrapper();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json("Get: Index");
});

app.get('/test', (req, res) => {
    const response = imgScrap.scrape();
    res.status(200).json(response);
});

// const port = 3001;
// app.listen(port, () => {
//     console.log("Listening");
// })

exports.lambdaHandler = serverless(app);