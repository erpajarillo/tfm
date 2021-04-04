import { ScrapeImageUseCase } from "./port/in/ScrapeImageUseCase";
import { RetrieveImagesPort } from "./port/out/RetrieveImagesPort";
import { SendImageEventsPort } from "./port/out/SendImageEventsPort";

export class ScrapeImageService implements ScrapeImageUseCase {

  private imageRetriever: RetrieveImagesPort;
  private imageEvent: SendImageEventsPort;

  constructor(imageRetriever: RetrieveImagesPort, imageEvent: SendImageEventsPort) {
    this.imageRetriever = imageRetriever;
    this.imageEvent = imageEvent;
  }

  scrapeImage = async(): Promise<any> => {
    const images = await this.imageRetriever.retrieveImages();

    for(let image of images) {
      await this.imageEvent.sendImageEvent(image, {
        url: 'https://raul.gg/',
        cameraName: image.substr(image.length - 2),
      });
    }
  }
}