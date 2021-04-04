import { ScrapeImageUseCase } from "../../Application/port/in/ScrapeImageUseCase";

export class ImageScrapperController {
  scrape = async (scrapeImageUseCase: ScrapeImageUseCase) => {
    scrapeImageUseCase.scrapeImage();
  }
}