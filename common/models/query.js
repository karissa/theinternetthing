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

  Query.remoteMethod('stop', {
    http: {path: '/stop', verb: 'get'},
    accepts: {arg: 'id', type: 'number', http: {source: 'query'}},
    returns: {arg: 'status', type: 'string'}
  })
  Query.remoteMethod('start', {
    http: {path: '/start', verb: 'get'},
    accepts: {arg: 'id', type: 'number', http: {source: 'query'}},
    returns: {arg: 'status', type: 'string'}
  })
  return Query
}
