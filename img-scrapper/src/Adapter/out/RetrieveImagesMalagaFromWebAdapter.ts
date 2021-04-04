import { RetrieveImagesPort } from "../../Application/port/out/RetrieveImagesPort";
import { StoreImagesAWSAdapter } from "./StoreImagesAWSAdapter";
import axios from "axios";

export class RetrieveImagesMalagaFromWebAdapter implements RetrieveImagesPort {

  private readonly pathUrl: string;
  private readonly totalCameras: number;

  constructor() {
    this.pathUrl =
      "http://www.malaga.eu/recursos/movilidad/camaras_trafico/TV-";
    this.totalCameras = 99;
  }

  retrieveImages = async(): Promise<string[]> => {
    let cameraNumber = 1;
    let imageNames = [];

    const aws = new StoreImagesAWSAdapter();

    do {
      const cameraName = this.getCameraName(cameraNumber);
      const url = `${this.pathUrl}${cameraName}.jpg?dummy=${Date.now()}`;
      const imgName = `${Date.now()}-${cameraName}`;

      const responseDownloadImage = await this.downloadImage(url);
      if (responseDownloadImage.status) {
        const responseStoreImage = await aws.storeImage(
          imgName,
          responseDownloadImage.image
        );

        if (responseStoreImage.status) imageNames.push(imgName);
      }

      cameraNumber += 1;
      setTimeout(() => {
        console.log("Sleeping 1 sec...");
      }, 1000);
    } while (cameraNumber <= this.totalCameras);

    return imageNames;
  }

  private downloadImage = async(url: string): Promise<any> => {
    return await axios({ url: url, method: "GET", responseType: "stream" })
      .then(async (response) => {
        // eslint-disable-next-line no-prototype-builtins
        if (response.headers.hasOwnProperty("expires")) {
          console.log("info", { msg: "Image Downloaded", url });
          return { status: true, msg: "Image Downloaded", image: response };
        } else {
          console.log("info", { msg: "Image Not Downloaded", url });
          return {
            status: false,
            msg: `Error downloading image. Error: Not an image`,
            image: null,
          };
        }
      })
      .catch((err) => {
        console.log("error", { msg: "Image Download Failed", url, err });

        return {
          status: false,
          msg: `Error downloading image. Error: ${err}`,
          image: null,
        };
      });
  }

  private getCameraName = (cameraNumber: number): string => {
    return cameraNumber.toString().length === 1
      ? "0" + cameraNumber
      : cameraNumber.toString();
  };
}