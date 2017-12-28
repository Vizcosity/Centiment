/**
 * For a specific cryptocurrency, aggregates data from news sites,
 * performs sentiment analysis and a succint summary of all news topics,
 * highlighting the most and least important for the current scrape.
 */

const getNewsLinks = require('./getNewsLinks');
const analyseArticle = require('./analyseArticle');

// Module entry point.
module.exports = (cid) => new Promise((resolve, reject) => {

  // Get news links for the currency.
  getNewsLinks(cid)
  .then(links => {

    log(`Obtained ${links.length} links. Analysing now.`);

    // For each link we want to visit the site and perform a sentiment analysis.
    // We will then attach the article analysis to the current link item.
    analyseAll(links, (analysedArticles) => {

      // Calculate the average sentiment, highlight the highest and lowest
      // sentiment articles, and return a summary of all text.
      console.log(analysedArticles);
    });

  });

});

// Analyse all news articles passed.
function analyseAll(links, callback, output){

  if (!output) output = [];
  if (!links || links.length === 0) return callback(output);

  var ci = links.shift();

  console.log(ci);

  log(`Analysing ${ci.title} [${links.length} left]`);

  analyseArticle(ci.link)
  .then(analysis => {
    // Output a merged object containing the link info as well as the analysis.
    output.push(Object.assign(ci, analysis));

    // Recursive call.
    return analyseAll(links, callback, output);
  })
  .catch(e => {
    log(`Could not parse item: ${ci.title}: ${e}`);
    return analyseAll(links, callback, output);
  });

}

function log(message){
  console.log(`AGGREGATE | ${message}`);
}
