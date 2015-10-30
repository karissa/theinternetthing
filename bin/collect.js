var server = require('./server/server.js')
var Twitter = require('twitter')

var client = new Twitter({
  consumer_key: process.env.TWITTER_KEY,
  consumer_secret: process.env.TWITTER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET
})

var Query = server.models.Query
Query.find({ where: { running: 'true' } }, function (err, queries) {
  if (err) throw err
  for (var i in queries) {
    var query = queries[i]
    var includes = query.params.includes.map(function (item) { return item.value })
    var text = includes.join(',')
    client.stream('statuses/filter', {track: text}, function (stream) {
      stream.on('data', function (data) {
        var tweet = {
          text: data.text,
          created_at: data.created_at,
          id: data.id,
          coordinates: data.coordinates,
          in_reply_to_status_id: data.in_reply_to_status_id,
          in_reply_to_user_id: data.in_reply_to_user_id,
          user: {
            id: data.user.id,
            followers_count: data.user.followers_count,
            friends_count: data.user.friends_count
          }
        }
        queries[0].tweets.create({data: tweet}, function (err, tweet) {
          if (err) return console.error(err)
        })
      })
      stream.on('error', function (error) {
        console.error(error)
      })
    })

  }
})
