/**
 * Grabs top 50 coins from coinmarketcap api and collects news data on them.
 */

const request = require('request');
const collect = require('../modules/collect');

log(`Getting hottest currencies from coinmarketcap...`);

request.get('https://api.coinmarketcap.com/v1/ticker/?limit=50', (err, res, body) => {

  var cids = [];
  body = JSON.parse(body);
  body.forEach(currency => cids.push(currency.symbol));

  log(`Collected ${cids.length} currencies: ${cids}`);

  collect(cids).then(() => {
    log(`Finished aggregating news data on ${cids.length} top currencies.`);
  })

});

function log(message){
  console.log(`AGGREGATE CMP | ${message}`);
}
