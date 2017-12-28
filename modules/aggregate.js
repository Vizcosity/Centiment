/**
 * For a specific cryptocurrency, aggregates data from news sites,
 * performs sentiment analysis and a succint summary of all news topics,
 * highlighting the most and least important for the current scrape.
 */

const getNewsLinks = require('./getNewsLinks');
const analyseArticle = require('./analyseArticle');
const in_a = require('in-a-nutshell');

// Module entry point.
module.exports = (cid, limit) => new Promise((resolve, reject) => {

  // Get news links for the currency.
  getNewsLinks(cid, limit)
  .then(links => {

    log(`Obtained ${links.length} links. Analysing now.`);

    // For each link we want to visit the site and perform a sentiment analysis.
    // We will then attach the article analysis to the current link item.
    analyseAll(links, (analysedArticles) => {

      log(`Analysed all links. ${analysedArticles.length}`);

      // Calculate the average sentiment, highlight the highest and lowest
      // sentiment articles, and return a summary of all text.

      // Create output object.
      var output = {
        analysed: analysedArticles,
        sentiment: {
          highest: analysedArticles[0],
          lowest: analysedArticles[0],
          average: 0,
          total: 0
        },
        summary: ""
      };

      // Find highest, lowest (highlights) and average.
      var wholeText = ""; // We will accumulate all text and then summarize at end.
      analysedArticles.forEach(article => {

        // Check highest and lowest sentiments (highlights) and update accordingly.
        output.sentiment.highest =
          (article.sentiment.score > output.sentiment.highest.sentiment.score ?
            article : output.sentiment.highest);

        output.sentiment.lowest =
          (article.sentiment.score < output.sentiment.lowest.sentiment.score ?
            article : output.sentiment.lowest);

        output.sentiment.total += article.sentiment.score;

        wholeText += '\n' + article.summary;

      });

      // Calculate average and summarise wholeText.
      output.sentiment.average = Math.round(output.sentiment.total / analysedArticles.length);
      output.summary = in_a.nutshell(wholeText);

      log(`Finished analysis`);

      // Resolve promise.
      return resolve(output);


    });



  });

});

// Analyse all news articles passed.
function analyseAll(links, callback, output){

  if (!output) output = [];
  if (!links || links.length === 0) return callback(output);

  var ci = links.shift();

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
