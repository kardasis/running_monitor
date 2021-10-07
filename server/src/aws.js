const AWS = require('aws-sdk')
const dotenv = require('dotenv')

dotenv.config()

module.exports = Object.freeze({
  putToS3: function(runName, runData, bucketName) {
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

    s3.upload(params, function (err, data) {
      if (err) {
        throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
    })
  }
})
