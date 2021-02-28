const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
import {Measurements} from './db/measurements.js';
import {config} from './config/config';

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());

const PollutionData = new Measurements();

app.get('/all', async (req: any, res: any) => {
  const response = await PollutionData.findAll();
  res.json(response);
});

app.get('/all/cameras', async (req: any, res: any) => {
  const response = await PollutionData.findAllPerCamera();
  res.json(response);
});

app.get('/all/grouped', async (req: any, res: any) => {
  const response = await PollutionData.findAllPerCameraGrouped();
  res.json(response);
});

app.get('/today', async (req: any, res: any) => {
  const response = await PollutionData.findToday();
  res.json(response);
});

app.get('/today/cameras', async (req: any, res: any) => {
  const response = await PollutionData.findTodayPerCamera();
  res.json(response);
});

const port = config.ExpressPort || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});