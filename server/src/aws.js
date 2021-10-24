const AWS = require('aws-sdk')
const dotenv = require('dotenv')

dotenv.config()

module.exports = Object.freeze({
  fetchRun: async function(runName) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET
    })
    const Key = `${runName}.json`
    const params = {
      Bucket: 'arikardasis-runs',
      Key
    }
    const res = await s3.getObject(params).promise()
    return res.Body.toString()
  },
  fetchRuns: async function() {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET
    })
    const params = {
      Bucket: 'arikardasis-runs'
    }
    const res = await s3.listObjects(params).promise()
    return res.Contents
  },
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
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
