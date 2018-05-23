const hmac_sha1 = require('../encrypt/hmac_sha1');
const urlsafe_base64_encode = require('../encrypt/urlsafe_base64_encode');

/**
 * HTTP 请求鉴权
 * 官方文档：https://developer.qiniu.com/pili/api/2772/http-requests-authentication
 */
module.exports = function(options){

  // 构造待签名的 Data

  //  1. 添加 Path
  let data = options.method + ' ' + options.path;

  // 2. 添加 Query，前提: Query 存在且不为空
  if (options.query) {
    data += '?' + options.query
  }

  // 3. 添加 Host
  data += "\nHost: " + options.host;

  let ContentType = options['Content-Type']? options['Content-Type'] : (options.headers? options.headers['Content-Type'] : '');

  // 4. 添加 Content-Type，前提: Content-Type 存在且不为空
  if (ContentType) {
    data += "\nContent-Type: " + ContentType;
  }

  // 5. 添加回车
  data += "\n\n";

  // 6. 添加 Body，前提: Content-Length 存在且 Body 不为空，同时 Content-Type 存在且不为空或 "application/octet-stream"
  let bodyOK = ContentType && options.body;
  let contentTypeOK = ContentType && ContentType !== "application/octet-stream";
  if (bodyOK && contentTypeOK) {
    data += JSON.stringify(options.body);
  }

  // 计算 HMAC-SHA1 签名，并对签名结果做 URL 安全的 Base64 编码
  let sign = hmac_sha1(this.SecretKey, data);
  let encodedSign = urlsafe_base64_encode(sign);

  // 将 Qiniu 标识与 AccessKey、encodedSign 拼接得到管理凭证
  let QiniuToken = "Qiniu " + this.AccessKey + ":" + encodedSign;

  return QiniuToken;
};