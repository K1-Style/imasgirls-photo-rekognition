const axios = require('axios');
const fs = require('fs');
const path = require('path');
// S3
const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const bucketName = process.env.BUCKET_NAME;

const collection = require('./collection');

exports.initialIndexFaces = () => {
    return listImageObjects()
    .then( (objects) => {
        let promises = [];
        for (let i = 0; i < objects.Contents.length; i++){
            if(objects.Contents[i].Key == '.tweet_since_id'){
                console.log('.tweet_since_id continue.');
                continue;
            }
            promises.push(collection.indexFaces(objects.Contents[i].Key));
        }
        return Promise.all(promises)
            .then( (results) => {
                console.log('initial finished');
                return results;
            });
    })
    .catch( (error) => {
        throw error;
    });
}

const listImageObjects = () => {
    const params = {
        Bucket: bucketName,
        MaxKeys: 200
    };
    return s3.listObjects(params).promise();
};