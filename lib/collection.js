// Rekognition
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition({apiVersion: '2016-06-27', region: 'us-east-1'});

const path = require('path');

const bucketName = process.env.BUCKET_NAME;
const rekognitionCollectionId = process.env.REKOGNITION_COLLECTION_ID;

exports.indexFaces = (key) => {
    const ids = key.split('/');
    const externalImageId = ids[ids.length-1];
    // jpgかpngだけをサポートしてるので、それ以外は分析対象外
    const params = {
        CollectionId: rekognitionCollectionId, 
        DetectionAttributes: [], 
        ExternalImageId: externalImageId, 
        Image: {
            S3Object: {
                Bucket: bucketName, 
                Name: key
            }
        }
    };
    return rekognition.indexFaces(params).promise()
        .then((data) => {
            console.log('index faces completed.');
            console.info(data);
            return data;
        })
        .catch((err) => {
            throw err;
        });
};

exports.deleteFaces = (faces) => {
    let faceIds = [];
    for (i = 0; i < faces.length; i++){
        faceIds.push(faces[i].FaceId);
    }
    if(faceIds.length == 0){
        // 削除対象がなければ何もしない
        console.log('no such faceids: ' + faceIds);
        return new Promise( () => {
            return {};
        });
    }
    const params = {
        CollectionId: rekognitionCollectionId, 
        FaceIds: faceIds
    };
    return rekognition.deleteFaces(params).promise()
        .then((data) => {
            console.log('delete faces completed.');
            console.info(data);
            return data;
        })
        .catch((err) => {
            throw err;
        });
};

exports.searchFaces = (key) => {
    const ids = key.split('/');
    const externalImageId = ids[ids.length-1];
    // 検索用
    const isThisName = (element, index, array) => {
        if(element == null || element.ExternalImageId != externalImageId){
            return false;
        }
        return true;
    };
    const params = {
        CollectionId: rekognitionCollectionId, 
        MaxResults: 20
    };
    return rekognition.listFaces(params).promise()
        .then( (data) => {
            console.log('list faces completed.');
            const faces = data.Faces.filter(isThisName);
            console.info(faces);
            return faces;
        })
        .catch( (err) => {
            throw err;
        });
};

exports.matchFaces = (bufferImage) => {
    const response = {};
    response.result = "ERROR";// デフォルトはエラー
    response.matchedFaces = null;
    response.stackTrace = null;

    const params = {
        CollectionId: rekognitionCollectionId, 
        FaceMatchThreshold: 0, 
        Image: {
            Bytes: bufferImage
        }, 
        MaxFaces: 5
    };

    return rekognition.searchFacesByImage(params).promise()
        .then( (data) => {
            if(data != null && data.FaceMatches != null && data.FaceMatches.length > 0){
                // マッチする顔画像があった場合
                console.log('face search OK');
                console.log(data.FaceMatches);
                response.result = 'OK';
                response.matchedFaces = data.FaceMatches;
                return response;
            }else{
                // マッチする顔画像がなかった場合
                console.log('face search NG');
                response.result = 'NG';
                return response;
            }
        })
        .catch( (err) => {
            console.error(err);
            response.stackTrace = err.stack;
            return response;
        });
}
