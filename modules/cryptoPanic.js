/**
 *  Sentiment aggregator for cryptocurrency.
 *  @ Aaron Baw 2017
 */
const sentiment = require('sentiment');
const request = require('request');
const config = require('./config');


// Takes in array of paginated urls from cryptopanic and scrapes each once
// collecting sentiment data and vote polarity.
function getCPCurrencyDataFromURLArray(urlArray, callback, carryObj){

  if (!urlArray || urlArray.length === 0) return callback(carryObj);
  var ci = urlArray.shift();


  // Carry object should be created by getCPCurrencyDataFromURL method
  // if not passed on first invokation.
  getCPCurrencyDataFromURL(ci, carryObj).then(updatedCarryObj => {
    getCPCurrencyDataFromURLArray(urlArray, callback, updatedCarryObj);
  });

}

const getCPCurrencyDataFromURL = (url, currencies) => new Promise(resolve => {

  request.get(url, (err, results) => {

    if (err) reject(err);


    try {
      results = JSON.parse(results.body).results;
    } catch(e){
      return resolve(currencies);
    }


    // TODO: Grab all of the posts by paginating the
    // Now that we have results we need t find all distinct currencies and start
    // attaching data to each one. We want to build an array of all relevant
    // news items for each currency and also the total votes for each type
    // of content.

    if (!currencies) currencies = {};

    results.forEach(result => {

      // Skip if no currency information.
      if (!result.currencies) return false;

      // Attach information for each currency information.
      result.currencies.forEach(currency => {

        var currencyID = currency.code;
        // Create the object entry for the given currency code if it hasn't
        // already been made.
        if (!currencies[currencyID]) currencies[currencyID] = {
          posts: [],
          stats: {
            positive: 0,
            negative: 0,
            important: 0
          },
          headlineSentiment: null
        }

        // Add the post.
        currencies[currencyID].posts.push(result);

        // Increment the stats.
        currencies[currencyID].stats.positive += (result.votes && result.votes.positive ? result.votes.positive : 0);
        currencies[currencyID].stats.negative += (results.votes && result.votes.negative ? result.votes.negative : 0);
        currencies[currencyID].stats.important += (result.votes && result.votes.important ? result.votes.important : 0);

      })
    });

    // Attach sentiment for each currency.
    Object.keys(currencies).forEach(currencyID => {
      currencies[currencyID].headlineSentiment = getSentiment(currencies[currencyID].posts)
    });

    // Return data once collected and processed.
    resolve(currencies);

  });

});



// Wrap get URL method into a promise.
const getCryptoPanicScrapeURLs = (url) => new Promise(resolve => {

  getCryptoPanicScrapeURLSLogic(url, urls => {
    resolve(urls);
  });

});

function getCryptoPanicScrapeURLSLogic(url, callback, carryArray){

  if (!carryArray) carryArray = [];
  carryArray.push(url);

  request.get(url, (err, response, body) => {

    try {
      body =  JSON.parse(body);
    } catch(e){
      return callback(carryArray);
    }

    if (!body.next) return callback(carryArray);
    setTimeout(() => {
      getCryptoPanicScrapeURLSLogic(body.next, callback, carryArray);
    }, 500);
  });

};


// Takes in currency data object and attaches sentiment based off of news
// headlines.
function getSentiment(currencyData){
  var titles = [];
  currencyData.forEach(post => titles.push(post.title));
  return getSentimentForHeadlines(titles);
}

// Takes in news headlines and runs the sentiment analysis on the headlines
// of each article posted about that currency, returning total summed sentiment score.
function getSentimentForHeadlines(headlines){
    var totalSentiment = 0;
    // Loop through all currencies and analyze the news headlines.
    headlines.forEach(headline => {
        totalSentiment += sentiment(headline).score;
    });
    return totalSentiment;
};

// Finds the most popular news topics and associates them with a particular
// currency, returning the news items attached to the currency and giving
// and overview of all the 'positive', 'negative' and 'important' points
// scored for each currency.
const scrapeCryptoPanic = () => new Promise(resolve => {

  // Get scrape urls.
  getCryptoPanicScrapeURLs(`${config.api.url}api/posts/?auth_token=${config.api.token}`)
  .then(urls => {
    getCPCurrencyDataFromURLArray(urls, resolve);
  });

});


// Register the module.
module.exports = scrapeCryptoPanic;
