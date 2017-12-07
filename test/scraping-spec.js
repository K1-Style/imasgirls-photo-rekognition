const assert = require('chai').assert;
const scraping = require('../lib/scraping.js');

// test data.
const testData = require('./twitter_test.json');
const scrap = new scraping(testData, null);

describe('twitterレスポンスチェック', () => {
  it('画像取得チェック', () => {
    const getImages = scrap.getImages();
    assert.equal(getImages[0].tweetId, '938306833240018944', 'Twitter twiiterID確認');
    assert.equal(getImages[0].image, 'https://pbs.twimg.com/media/DQWJDwlWAAAkOD-.jpg', '画像URL確認');
    assert.equal(getImages[0].user, 'krs2kn', 'Twitter User名確認');
    assert.equal(getImages.length, 1, 'image数');
  });

  it('since_idチェック', () => {
    scrap.updateSinceId();
    assert.equal(scrap.getSinceId(), '938306833240018944', 'Twitter list取得用のsince_id確認');
  });
});