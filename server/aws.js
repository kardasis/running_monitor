const AWS = require('aws-sdk')
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET
})

module.exports = {
    putToS3: function putToS3(runData) {
        console.log('putting data to s3')
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: runData[0].timestamp,
            Body: runData
        };

        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);
        })
    }
}