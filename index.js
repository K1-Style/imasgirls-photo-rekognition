const Twitter = require('twitter');
const scraping = require('./lib/scraping.js');
const download = require('./lib/download.js');
const collection = require('./lib/collection.js');
const initial = require('./lib/initial.js');

const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const params = {
    slug: 'imasgirls',
    owner_screen_name: 'k1_style',
    count: 100
};

module.exports.scrap = (event, context, callback) => {
    // since_id（取得する基準となるtweetId）
    download.getSinceIdPromise()
        .then((sinceId) => {
            params.since_id = sinceId;
            console.log(`since_id:${params.since_id}`);
            return sinceId;
        })
        .then((sinceId) => {
            // list取得
            client.get('lists/statuses', params)
            .then((tweet) => {
                const scrap = new scraping(tweet, sinceId);
                scrap.updateSinceId();
                const getImages = scrap.getImages();
                for(let i = 0; i < getImages.length; i++){
                    // 画像をS3へ保存
                    download.imageDownload(getImages[i]);
                }
                // since_id更新
                if(sinceId != scrap.getSinceId()){
                    download.setSinceId(scrap.getSinceId());
                }
                console.log(getImages);
            })
            .catch((error) => {
                throw error;
            });
        })
        .catch( (error) => {
            throw error;
        });
}

module.exports.indexFaces = (event, context, callback) => {
    collection.indexFaces(event.Records[0].s3.object.key)
        .then( (data) => {
            console.log('completed');
        } )
        .catch( (error) => {
            throw error;
        });
}

module.exports.deleteFaces = (event, context, callback) => {
    collection.searchFaces(event.Records[0].s3.object.key)
        .then( (faces) => {
            collection.deleteFaces(faces);
        })
        .catch( (error) => {
            throw error;
        });
}

module.exports.initialIndexFaces = (event, context, callback) => {
    initial.initialIndexFaces()
        .then( (results) => {
            console.info(results);
        })
        .catch( (error) => {
            throw error;
        });
}