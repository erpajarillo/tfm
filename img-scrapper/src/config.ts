require('dotenv').config();

export const config = {
    AccessKey: process.env.AccessKey,
    SecretKey: process.env.SecretKey,
    AWSRegion: process.env.AWSRegion,
    LogglyKey: process.env.LogglyKey,
    LogglySubdomain: process.env.LogglySubdomain,
    S3Bucket: process.env.S3Bucket
}