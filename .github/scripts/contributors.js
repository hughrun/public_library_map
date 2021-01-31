const fs = require('fs')
const cheerio = require('cheerio');
const pretty = require('pretty');
const page = fs.readFileSync('./website/sources/index.html', {encoding: 'utf-8' })
var contributors = fs.readFileSync('./contributors.txt', {encoding: 'utf-8' }).split('\n')
const $ = cheerio.load(page)
var eventJson = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, {encoding: 'utf-8' }));

$('#contributors-list').empty() // remove all names to start clean
for (let name of contributors) {
  if (name.length > 0) {
    for (let commit of eventJson.commits) {
      // we only look for authors, not commiters, so we automatically ignore "actions-user"
      if ( !contributors.includes(commit.author.name) ) {
        contributors.push(commit.author.name)
      }
    } 
    $('#contributors-list').append(`<li>${name}</li>\n`)
  }
}
// write out new contributors.html file
let newHtml = pretty($.html(), {ocd: true})
fs.writeFileSync('./website/sources/index.html', newHtml, {encoding: 'utf-8'})
// write out contributors.txt
let newTxt = "";
contributors.map( x => {
  if (x) {
    newTxt = newTxt.concat(`${x}\n`)
  }
})
fs.writeFileSync('./contributors.txt', newTxt, {encoding: 'utf-8'})
