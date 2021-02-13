require('dotenv').config();

export const config = {
    AccessKey: process.env.AccessKey,
    SecretKey: process.env.SecretKey,
    AWSRegion: process.env.AWSRegion
}