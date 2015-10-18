var fs = require('fs')
var path = require('path')
var router = require('page-router')
var Ractive = require('ractive-toolkit')
var enter = require('enter-means-submit')

var routes = [
  require('./routes/home.js'),
  require('./routes/new-query.js')
]

enter(document.getElementsByClassName('enter-means-submit'))

router('#content', routes, function (ctx) {
  new Ractive({
    el: '#content',
    template: ctx.template,
    data: ctx.data,
    onrender: ctx.onrender
  })
})
