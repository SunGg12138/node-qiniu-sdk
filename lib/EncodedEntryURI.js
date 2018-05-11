const urlsafe_base64_encode = require('./urlsafe_base64_encode');

/**
 * 构造EncodedEntryURI
 * 官方文档：https://developer.qiniu.com/kodo/api/1276/data-format
 * @param {String} bucket 
 * @param {String} fileName 
 */
module.exports = function(bucket, fileName){
  let entry = bucket + ':' + fileName;
  let encodedEntryURI = urlsafe_base64_encode(entry);
  return encodedEntryURI;
}