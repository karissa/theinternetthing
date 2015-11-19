module.exports = function (Query) {
  Query.stop = function (id, cb) {
    Query.findById(id, function (err, query) {
      if (err) throw err
      query.updateAttribute('running', false, function (err, obj) {
        if (err) throw err
        return cb(null, obj)
      })
    })
  }

  Query.start = function (id, cb) {
    Query.findById(id, function (err, query) {
      if (err) throw err
      query.updateAttribute('running', true, function (err, obj) {
        if (err) throw err
        return cb(null, obj)
      })
    })
  }

  Query.on('dataSourceAttached', function (query) {
    var find = Query.find
    // include the # of tweets in result as query.tweets
    Query.find = function (filter, opts, cb) {
      if (!filter) filter = {}
      if (typeof opts === 'function') cb = opts
      console.log(arguments)
      filter.include = 'tweets'
      find.apply(this, [filter, function (err, results) {
        for (var i in results) {
          results[i].tweets = results[i].tweets.length
        }
        return cb(err, results)
      }])
    }
  })

  return Query
}
