/**
 * Given an array of currency IDs, collects aggregate data and pushes it to the
 * POSTGRES db.
 */

const aggregate = require('./aggregate');
const DB = require('./db');

var db = new DB();



// Insert to DB func.
const insertToDB = (cid, data) => new Promise((resolve, reject) => {

  log(`Aggregated data for ${cid}.`);

  log(`Inserting ${cid} data to DB.`);

  // Create string template.
  const template =
  `WITH upsert AS (UPDATE centiment SET data=$2 WHERE cid=$1 RETURNING *)
    INSERT INTO centiment (cid, data) SELECT $1, $2 WHERE NOT EXISTS (SELECT * FROM upsert)`;

  // Execute query.
  db.queryParam(template, [cid, data], (err, res) => {
    if (err) return reject(err);
    log(`Successfully inserted ${cid} data to DB.`);
    return resolve(res);
  });

});

// Collects aggregate data for the CID and saves it to the DB.
const aggregateToDB = (cid) => new Promise((resolve, reject) => {
  return aggregate(cid, 10)
  .then(data => insertToDB(cid, data))
  .then(res => resolve(res));
});

function aggregateAllToDB(cids, cb){
  if (!cids || cids.length === 0) return cb();

  var ci = cids.shift();

  log(`Aggregating data for ${ci}`);

  aggregateToDB(ci).then(() => {
    return aggregateAllToDB(cids, cb);
  })
  .catch(e => log(`Error aggregating ${cid} and adding to the db: ${e}`));
}

// Register module at end so we have access to above promise definitions.
module.exports = (cids) => new Promise((resolve, reject) => {

  // Collect aggregate data for each currency and add it to the db.
  try {
    aggregateAllToDB(cids, () => {
      return resolve();
    })
  } catch(e){
    return reject(e);
  }

});

function log(message){
  console.log(`COLLECT | ${message}`);
}
