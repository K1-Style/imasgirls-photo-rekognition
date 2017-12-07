const axios = require('axios');
const path = require('path');
// S3
const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const bucketName = process.env.BUCKET_NAME;

const sinceIdFile = '.tweet_since_id';

exports.imageDownload = (image) => {
    axios({
          method: 'get',
          url: image.image,
          responseType:'arraybuffer'
    })
    .then( (response) => {
        putImageS3Object(image, response.data);
    })
    .catch( (err) => {
        console.error(err);
    });
}

exports.setSinceId = (sinceId) => {
    const params = {
        Bucket: bucketName,
        Key: sinceIdFile,
        Body: sinceId
    };
    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else     console.log(data);
    });
}

exports.getSinceIdPromise = () => {
    let sinceId = null;
    const params = {
        Bucket: bucketName,
        Key: sinceIdFile
    };
    return s3.getObject(params).promise()
        .then((data) => {
            return data.Body.toString();
        });
    
}

const putImageS3Object = (image, body) => {
    const filename = `${image.tweetId}_${image.user}_${image.number}${path.extname(image.image)}`;
    const params = {
        Bucket: bucketName,
        Key: filename,
        Body: body
    };
    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else     console.log(data);
    });
};