const hmac_sha1 = require('../hmac_sha1');
const urlsafe_base64_encode = require('../urlsafe_base64_encode');

/**
 * 获取管理凭证
 * 参考网址：https://developer.qiniu.com/kodo/manual/1201/access-token
 * 
 * @param {Object} options 
 */
module.exports = function(options){
  let { path, query, body } = options;

  // 1.生成待签名的原始字符串
  let signingStr = path;
  if (query) {
    signingStr += '?' + query + '\n';
  } else {
    signingStr += '\n';
  }
  if (body) signingStr += body;

  // 2.使用SecertKey对上一步生成的原始字符串计算HMAC-SHA1签名
  let sign = hmac_sha1(this.SecretKey, signingStr);

  // 3.对签名进行URL 安全的 Base64 编码
  let encodedSign = urlsafe_base64_encode(sign);

  // 4.将 AccessKey 和 encodedSign 用英文符号 : 连接起来
 let  accessToken = this.AccessKey + ':' + encodedSign;

 return accessToken;
};