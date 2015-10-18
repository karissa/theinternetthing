module.exports = function () {
  return function (err, req, res, next) {
    res.sendFile(require('path').join(__dirname, '../../client/index.html'))
  }
}
