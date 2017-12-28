/**
 * Given a currency code scrapes google news for articles regarding the currency.
 * Returns news links.
 */

// Dependencies.

// Allows us to resolve full name of currency from CID.
const cryptoNameDict = require('cryptocurrencies');

// Scrapes google news for articles regarding the currency of interest.
const scrapeNews = require('my-google-news');

module.exports = (cid) => new Promise((resolve, reject) => {

  cid = cid.toUpperCase();

  // If fullname exists in the dictionary, use this as part of the search query
  // as well.
  var query = cid + (cryptoNameDict[cid] ? ` OR ${cryptoNameDict[cid]}` : "");

  // Set max results per page for 100 for less pagination.
  scrapeNews.resultsPerPage = 100;

  // Output array containing links.
  var links = [];

  scrapeNews(query, (err, res) => {
    if (err) return reject(`Could not scrape news for ${cid}: ${err}`);

    // Push all links to output array.
    links.push(...res.links);

    // Continue looping until fail.
    if (res.next) return res.next();

    // Otherwise we resolve with all links we have gathered thus far.
    return resolve(links);
  });

});
