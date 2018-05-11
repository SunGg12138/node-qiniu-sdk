const hmac_sha1 = require('../hmac_sha1');
const urlsafe_base64_encode = require('../urlsafe_base64_encode');

/**
 * 获取上传凭证
 * 参考网址：https://developer.qiniu.com/kodo/manual/1208/upload-token
 * 
 * @param {*} options 
 */
module.exports = function(options){
  let { bucket, fileName, scope, returnBody, deadline } = options;

  // 1.构造上传策略
  scope = scope || bucket + ':' + fileName;
  let now = new Date();
  now.setHours(now.getHours() + 1);
  deadline = deadline || Math.round(now.getTime() / 1000);

  // 2.将上传策略序列化成为JSON
  let putPolicy = JSON.stringify({scope, deadline, returnBody});

  // 3.对 JSON 编码的上传策略进行URL 安全的 Base64 编码，得到待签名字符串
  let encodedPutPolicy = new Buffer(putPolicy).toString('base64');

  // 4.使用访问密钥（AK/SK）对上一步生成的待签名字符串计算HMAC-SHA1签名
  let sign = hmac_sha1(this.SecretKey, encodedPutPolicy);

  // 5.对签名进行URL安全的Base64编码
  let encodedSign = urlsafe_base64_encode(sign);

  // 6.将访问密钥（AK/SK）、encodedSign 和 encodedPutPolicy 用英文符号 : 连接起来
  let uploadToken = this.AccessKey + ':' + encodedSign + ':' + encodedPutPolicy;

  return uploadToken;
};