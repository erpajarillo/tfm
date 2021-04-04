// import { imgScrapper } from "./functions";
//
// const imgScrap = new imgScrapper();
//
// const init = async () => {
//   await imgScrap.scrape();
// };
//
// init()
//   .then(() => {
//     console.log("OK");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

import { ImageScrapperController } from "./Adapter/in/ImageScrapperController";
import { RetrieveImagesMalagaFromWebAdapter } from "./Adapter/out/RetrieveImagesMalagaFromWebAdapter";
import { RetrieveImagesMalagaFromAWSAdapter } from "./Adapter/out/RetrieveImagesMalagaFromAWSAdapter";
import { ScrapeImageService } from "./Application/ScrapeImageService";
import { SendImageKafka } from "./Adapter/out/SendImageKafka";

const init = async () => {
  console.log("Scrapper Started!");
  const scrapper = new ImageScrapperController();

  const retrieveImageAdapter = new RetrieveImagesMalagaFromWebAdapter();
  const sendEventAdapter = new SendImageKafka();
  const service = new ScrapeImageService(retrieveImageAdapter, sendEventAdapter);

  await scrapper.scrape(service);
};

init()
  .then(() => {
    console.log("Scrapper Executed!");
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    console.log("Scrapper Ended!");
  });
