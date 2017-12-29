/**
 * Interface wrapper for obtaining processed currency data from the POSTGRES
 * DB.
 */

 var DB = require('./db');

 module.exports = function(db){
   if (!db) db = new DB();

   // Returns all data collected on a given CID.
   this.getAllDataOnCurrency = (cid) => new Promise((resolve, reject) => {
     db.query(`SELECT DISTINCT * FROM centiment where cid='${cid}'`, (err, data) => {
       if (err) return reject(err);
       var item = data.rows[0];

       // If there is no data on the currency, return an empty object.
       if (Object.keys(item).length === 0) return resolve({});
       return resolve(data);
     });
   });

 }
