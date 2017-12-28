/**
 *  Takes in an article URL and returns a sentiment analysis on the article.
 */

// Dependencies.
const request = require('request');
const article = require('article');
const sentiment = require('sentiment');
const in_a = require('in-a-nutshell');

 // Register module.
 module.exports = (url) => new Promise((resolve, reject) => {

   getAndParseArticle(url)
   .then(article => {

     if (!article) return reject(`Article could not be parsed.`);

     // Run sentiment analysis on article body
     return resolve({
       title: article.title,
       summary: in_a.nutshell(article.text),
       sentiment: sentiment(article.text)
     });
   })
   .catch(err => reject(err));

 });

// Takes article URL and returns parsed object containing the article text, image
// and title.
 const getAndParseArticle = (url) => new Promise((resolve, reject) => {

   // Load the page.
   request.get(url).pipe(article(url, (err, result) => {
     if (err) return reject(err);

     return resolve(result);
   }));
 });
