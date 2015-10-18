var fs = require('fs')
var path = require('path')

module.exports = {
  url: '/query',
  template: fs.readFileSync(path.join(__dirname, '../templates/new-query.html')).toString(),
  onrender: function () {
    console.log('query')
  }
}
