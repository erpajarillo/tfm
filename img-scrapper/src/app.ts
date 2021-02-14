import serverless from 'serverless-http';
import express from 'express';
import bodyParser from 'body-parser';
import {imgScrapper} from './functions';

const imgScrap = new imgScrapper();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/test', (req, res) => {
    res.status(200).json("Get: Index");
});

app.get('/', async (req, res) => {
    const response = await imgScrap.scrape();
    // res.status(200).send(response);
    res.send(response)
});

// const port = 3001;
// app.listen(port, () => {
//     console.log("Listening");
// })

exports.lambdaHandler = serverless(app);