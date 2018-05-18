const fs = require('fs');
const request = require('request');
const rp = require('request-promise');
const urlsafe_base64_encode = require('./encrypt/urlsafe_base64_encode');

/**
 * 文件HASH值
 * 官方文档：https://developer.qiniu.com/dora/manual/1297/file-hash-value-qhash
 */
module.exports.qhash = function(url, algorithm){
  algorithm = algorithm || 'sha1';
  return rp({
    url: url + '?qhash/' + algorithm,
    json: true
  });
};
/**
 * 文本文件合并
 * 官方文档：https://developer.qiniu.com/dora/manual/1253/text-file-merging-concat
 */
module.exports.concat = function(mimeType, urls){
  let url_1 = urls.shift(),
      encodedMimeType = urlsafe_base64_encode(url_1);
  
  let url = url_1 + '?concat/mimeType/' + encodedMimeType;
  urls.forEach(item => {
    url += '/' + urlsafe_base64_encode(item);
  });
  return rp({
    url: url,
    json: true
  });
};
/**
 * 多文件压缩
 * 官方文档：https://developer.qiniu.com/dora/manual/1667/mkzip
 */
module.exports.mkzip = function(mimeType, urls){
  let url_1 = urls.shift(),
      encodedMimeType = urlsafe_base64_encode(url_1);
  
  let url = url_1 + '?concat/mimeType/' + encodedMimeType;
  urls.forEach(item => {
    url += '/' + urlsafe_base64_encode(item);
  });
  return rp({
    url: url,
    json: true
  });
};
/**
 * MD转HTML
 * 官方文档：https://developer.qiniu.com/dora/manual/1285/md-html-md2html
 */
module.exports.md2html = function(url, options = {}){
  let path = 'md2html';
  options.mode = options.mode || 0;
  path += '/' + options.mode;
  if (options.cssUrl) path += '/css/' + urlsafe_base64_encode(options.cssUrl);
  console.log(url + '?' + path)
  return rp({
    url: url + '?' + path,
    json: true
  });
};
/**
 * 资源下载二维码
 * 官方文档：https://developer.qiniu.com/dora/manual/1298/resource-download-the-qr-code-qrcode
 */
module.exports.qrcode = function(url, options = {}){
  let path = 'qrcode';
  options.mode = options.mode || 0;
  path += '/' + options.mode;
  if (options.level) path += '/level/' + options.level;

  url += '?' + path;

  if (!options.path && !options.stream) return Promise.resolve(url);

  let writeStream = options.stream || fs.createWriteStream(options.path);
  return new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    request({ url, json: true }).on('error', reject).pipe(writeStream);
  });
};