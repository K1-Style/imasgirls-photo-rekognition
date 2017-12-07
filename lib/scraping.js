const Image = require('./model/image');

const scraping = function (tweets, sinceId) {
    this.tweets = tweets;
    this.sinceId = sinceId;
};

scraping.prototype.getImages = function () {
    let images = [];
    for (let i = 0; i < this.tweets.length; i++){
        const tweet = this.tweets[i];
        if(tweet.extended_entities != undefined && tweet.extended_entities.media != undefined){
            Array.prototype.push.apply(images, setMediaImages(tweet));
        }
    }
    return images;
};

scraping.prototype.updateSinceId = function () {
    if (this.tweets.length > 0) {
        this.sinceId = this.tweets[0].id_str;
    }
};

scraping.prototype.getSinceId = function () {
    return this.sinceId;
};

const setMediaImages = (tweet) => {
    let mediaImages = [];
    for (let i = 0; i < tweet.extended_entities.media.length; i++){
        const media = tweet.extended_entities.media[i];
        if(media.type == 'photo'){
            mediaImages.push(new Image(tweet.id_str, tweet.text, media.media_url_https, tweet.user.screen_name, i));
        }
    }
    return mediaImages;
}

module.exports = scraping;