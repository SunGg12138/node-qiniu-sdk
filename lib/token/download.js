const hmac_sha1 = require('../encrypt/hmac_sha1');
const urlsafe_base64_encode = require('../encrypt/urlsafe_base64_encode');

/**
 * 获取下载凭证，返回的是最后的下载 URL
 * 参考网址：https://developer.qiniu.com/kodo/manual/1202/download-token
 * 
 * @param {*} options 
 */
module.exports = function(options){
  
  // 1.构造下载 URL
  let DownloadUrl = options.url;

  // 2.为下载 URL 加上过期时间 e 参数，Unix时间戳
  if (!options.deadline) {
    let now = new Date();
    now.setHours(now.getHours() + 1);
    options.deadline = Math.round(now.getTime() / 1000);
  }

  // ？的位置
  let pos = DownloadUrl.indexOf('?');
  if (pos < 0) {
    DownloadUrl = DownloadUrl + '?e=' + options.deadline;
  } else if (pos === DownloadUrl.length - 1) {
    DownloadUrl = DownloadUrl + 'e=' + options.deadline;
  } else {
    DownloadUrl = DownloadUrl + '&e=' + options.deadline;
  }

  // 带有参数的情况下,需要将query一起进行签名
  if (options.query) {
    for (let key in options.query) {
      DownloadUrl += ('&' + key + '=' + options.query[key]);
    }
  }

  // 3.对上一步得到的 URL 字符串计算HMAC-SHA1签名（假设访问密钥（AK/SK）是 MY_SECRET_KEY），并对结果做URL 安全的 Base64 编码：
  let sign = hmac_sha1(this.SecretKey, DownloadUrl);
  let encodedSign = urlsafe_base64_encode(sign);

  // 4.将访问密钥（AK/SK）（假设是 MY_ACCESS_KEY）与上一步计算得到的结果用英文符号 : 连接起来
  let download_token = this.AccessKey + ':' + encodedSign;

  // 5.将上述 Token 拼接到含过期时间参数 e 的 DownloadUrl 之后，作为最后的下载 URL
  let RealDownloadUrl = DownloadUrl + '&token=' + download_token;

  return RealDownloadUrl;
};