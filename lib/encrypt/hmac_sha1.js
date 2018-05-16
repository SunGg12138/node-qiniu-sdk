const crypto = require('crypto');

/**
 * HMAC-SHA1签名
 */
module.exports = function(key, str){
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(str);
  let sign = hmac.digest();
  return sign;
}