//UPD

var decodeSync = require('./index.js');

function decode(buffer, opts) {
  return new Promise(function(resolve) {
    resolve(decodeSync.decode.sync(buffer, opts));
  });
}

module.exports.decode = decode;