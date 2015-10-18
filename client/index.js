var fs = require('fs')
var path = require('path')
var router = require('page-router')

var routes = [
  {
    url: '/',
    template: fs.readFileSync(path.join(__dirname, 'templates/splash.html')).toString(),
    onrender: function () {
      console.log('splashit')
    }
  },
  require('./routes/new-query.js')
]

router('#content', routes)
