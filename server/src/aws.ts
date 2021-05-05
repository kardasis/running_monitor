import dotenv  from "dotenv"
dotenv.config()

import AWS from 'aws-sdk'


export async function putToS3(runName: string, runData: any[], bucketName: string) {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET
    })
    console.log('putting data to s3')
    const params = {
        Bucket: bucketName,
        Key: runName,
        Body: JSON.stringify(runData)
    };
    // await s3.upload(params).promise()

    s3.upload(params, function (err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    })
}