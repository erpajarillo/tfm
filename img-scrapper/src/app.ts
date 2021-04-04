import { imgScrapper } from "./functions";

const imgScrap = new imgScrapper();

const init = async () => {
  await imgScrap.scrape();
};

init()
  .then(() => {
    console.log("OK");
  })
  .catch((err) => {
    console.log(err);
  });
