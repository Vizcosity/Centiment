/**
 * Scrapes crypto panic for 'hot' coins, then aggregates news information with
 * sentiment analysis, saving results to the DB.
 */

 const cryptoPanic = require('./modules/cryptoPanic');
 const collect = require('./modules/collect');

log(`Collecting hottest currencies from CryptoPanic.`);

cryptoPanic.scrape().then(hottestCurrencies => {
  log(`Found ${Object.keys(hottestCurrencies).length} currencies: ${Object.keys(hottestCurrencies)}.`);
  log(`Scraping and analysing news data for each.`);

  collect(Object.keys(hottestCurrencies)).then(() => {
    log(`Finished aggregating on all hottest currencies.`);
  });
});

 function log(message){
   console.log(`AGGREGATE HOT | ${message}`);
 }
