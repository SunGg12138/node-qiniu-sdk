/**
 * 对签名进行URL安全的Base64编码
 * 官方文档：https://developer.qiniu.com/kodo/manual/1231/appendix#urlsafe-base64
 */
module.exports = function(url){
  let encodedSign = new Buffer(url).toString('base64');
  encodedSign = encodedSign.replace(/\+/g, '-');
  encodedSign = encodedSign.replace(/\//g, '_');
  return encodedSign;
}