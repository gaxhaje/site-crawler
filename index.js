// implementation of core jQuery for the server side.
const cheerio        = require('cheerio');
// simple HTTP request client with Promise support.
const requestPromise = require('request-promise');
// url parser
const url            = require('url');


// igonre the 1st 2 arguemnts:
// these are the command path to 'node' and the path to 'index.js'
const args    = process.argv.slice(2);
// search criteria
const website = args[0];
const keyword = args[1];
// const depth   = args[2];

// cheerio options
const options = {
  uri: website,
  transform: body => cheerio.load(body)
}


// use promises so we can search efficiently
requestPromise(options)
  .then($ => {
    // process html as if it were jQuery

    let links = [];
    let host = url.parse(website).host;

    // collect all links
    $('*').each(function () {
      let link = $(this).attr('href');

      console.log(link);
    });

    // console.log(links);

    // search for keyword
    // collect URLs within the same domain up to 'two' levels deep
    // const words = $('*').map(function (i, elem) {
    //   return $(this).text();
    // });

  })
  .catch(err => {
    // Crawling error
    // TODO: use a logging librariy
    console.log('Crawling error: ', err);
  });

