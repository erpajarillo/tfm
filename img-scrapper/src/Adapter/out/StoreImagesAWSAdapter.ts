import AWS from "aws-sdk";
import { config } from "../../config";

export class StoreImagesAWSAdapter {
  constructor() {
    AWS.config.update({
      accessKeyId: config.AWSAccessKey,
      secretAccessKey: config.AWSSecretKey,
      region: config.AWSRegion
    });
  }

  storeImage = async (imgName: string, response: any): Promise<any> => {
    const s3 = new AWS.S3();
    const params = {
      Bucket: `${config.S3Bucket}`,
      Key: imgName,
      Body: response.data,
      ContentType: response.headers["content-type"],
      ContentLength: response.headers["content-length"]
      // ACL: 'public-read'
    };

    s3.putObject(params, (err, data) => {
      if (err) {
        console.log("error", {
          msg: "AWS: Error storing image",
          imgName,
          bucket: config.S3Bucket,
          err
        });
        return { status: false, msg: `Error storing image. Error: ${err}` };
      } else {
        console.log("info", {
          msg: "AWS: Image Uploaded",
          imgName,
          data,
          bucket: config.S3Bucket
        });
      }
    });

    return { status: true, msg: `Image Uploaded` };
  };
}
