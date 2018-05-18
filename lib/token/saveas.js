const hmac_sha1 = require('../encrypt/hmac_sha1');
const EncodedEntryURI = require('../encrypt/EncodedEntryURI');
const urlsafe_base64_encode = require('../encrypt/urlsafe_base64_encode');

/**
 * 处理结果另存
 * https://developer.qiniu.com/dora/manual/1305/processing-results-save-saveas
 */
module.exports = function(url, bucket, fileName){

  let protocol = /^(http:\/\/|https:\/\/)/.exec(url)[0];

  // 1. 在下载 URL（不含 Scheme 部分，即去除 http : //）后附加 saveas 接口（不含签名部分）
  let NewURL = url.replace(protocol, '') + '|saveas/' + EncodedEntryURI(bucket, fileName);

  // 2. 使用 SecretKey 对新的下载 URL 进行HMAC1-SHA1签名
  let Sign = hmac_sha1(this.SecretKey, NewURL);

  // 3. 对签名进行URL安全的Base64编码
  let EncodedSign = urlsafe_base64_encode(Sign);

  // 4. 在新的下载 URL 后拼接签名参数
  let FinalURL = protocol + NewURL + '/sign/' + this.AccessKey + ':' + EncodedSign;
  
  return FinalURL;
};