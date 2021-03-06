// implementation of core jQuery for the server side.
const cheerio = require('cheerio');
const request = require('request');
const URL = require('url-parse');

// igonre the 1st 2 arguemnts:
// these are the command path to 'node' and the path to 'index.js'
const args    = process.argv.slice(2);
// search criteria
const START_WEBSITE = args[0];
const KEYWORD = args[1];
const DEPTH   = args[2];

// let foundOnPages = [];
let numPagesFound = 0;
let numPagesVisited = 0;
let pagesFound = [];
let pages = [[START_WEBSITE, 0]];
let pagesVisited = [];

const url = new URL(START_WEBSITE);
const baseUrl = url.protocol + '//' + url.hostname;

function crawl(depth) {

  if (typeof depth == 'number') {
    depth++;
  } else {
    depth = 0;
  }

  // don't visit a page twice
  let page = pages.pop();

  // if (!page || (depth) > DEPTH) {
  if (!page || page[1] > DEPTH) {
    console.log(`Crawled ${numPagesVisited} pages. Found ${numPagesFound} with the term '${KEYWORD}':`);
    pagesFound.forEach(p => console.log(p));
    return;
  }

  let uri = page[0];

  if (pagesVisited.includes(uri)) crawl(depth);
  else visitPage(uri, depth, crawl);
}

function visitPage(uri, depth, cb) {
  pagesVisited.push(uri);
  numPagesVisited++;

  request(uri, (err, response, body) => {
    if (response.statusCode !== 200) {
      cb(depth); // continue crawling
      return;
    }

    // parse page
    let $ = cheerio.load(body);
    let text = $('html > body').text().toLowerCase().replace(/\n/g, ' ');
    let idx = text.indexOf(KEYWORD.toLowerCase());

    if (idx > -1) {
      let prefixWord = text.substring(idx-10, idx).trim();
      let suffixWord = text.substring(idx, idx+10).trim();
      numPagesFound++;
      pagesFound.push(`${uri} => '${prefixWord} ${KEYWORD} ${suffixWord}'`);
    }

    collectLinks($, depth);

    cb(depth);
  });

}

function collectLinks($, depth) {
  let relativeLinks = $("a[href^='/']");
  relativeLinks.each(function () {
    pages.push([baseUrl + $(this).attr('href'), depth]);
  });
}

crawl(0);