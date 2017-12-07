'use strict';

const collection = require('./lib/collection.js');

module.exports.matchFaces = (event, context, callback) => {

    console.log(JSON.stringify(event));
    const bufferImage = new Buffer(event.body, 'base64');

    return collection.matchFaces(bufferImage)
        .then( (result) => callback(null, {
            statusCode: 200,
            body: JSON.stringify(result)
          }) )
        .catch( (err) => callback(null, {
            statusCode: 500,
            body: JSON.stringify(err)
          }) );
};