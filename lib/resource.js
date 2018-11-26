const fs = require('fs');
const rp = require('node-request-slim').promise;
const Extends = require('./extends');
const urlsafe_base64_encode = require('./encrypt/urlsafe_base64_encode');

/**
 * 文件HASH值
 * 官方文档：https://developer.qiniu.com/dora/manual/1297/file-hash-value-qhash
 */
exports.qhash = function(url, algorithm){
  if (!url) return Promise.reject('url is required');
  algorithm = algorithm || 'sha1';
  return rp({
    url: url + '?qhash/' + algorithm
  });
};
/**
 * 文本文件合并
 * 官方文档：https://developer.qiniu.com/dora/manual/1253/text-file-merging-concat
 */
exports.concat = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.mimeType) return Promise.reject('options.mimeType is required');
  if (!options.urls) return Promise.reject('options.urls is required');
  
  let { mimeType, urls, pfop } = options;

  let encodedMimeType = urlsafe_base64_encode(mimeType);
  
  let concat_fop = 'concat/mimeType/' + encodedMimeType;
  urls.forEach(item => {
    concat_fop += '/' + urlsafe_base64_encode(item);
  });

  // 如果有saveas需要曾加saveas操作
  if (options.saveas) {
    if (typeof options.saveas === 'object') {
      options.saveas = options.saveas.bucketName + ':' + options.saveas.fileName;
    }
    concat_fop += '|saveas/' + urlsafe_base64_encode(options.saveas);
  }
  // 如果pfop不是function，只返回fop
  if (typeof pfop !== 'function') return concat_fop;
  
  return pfop(concat_fop);
};
/**
 * 多文件压缩
 * 官方文档：https://developer.qiniu.com/dora/manual/1667/mkzip
 */
exports.mkzip = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.urls) return Promise.reject('options.urls is required');

  let { mode, encoding, urls, pfop } = options;

  mode = mode || 2;
  encoding = encoding || 'utf-8';

  let mkzip_fop = 'mkzip/' + mode + '/encoding/' + urlsafe_base64_encode(encoding);

  urls.forEach(item => {
    let type = typeof item;
    if (type === 'string') {
      mkzip_fop += '/url/' + urlsafe_base64_encode(item);
    } else if (type === 'object') {
      mkzip_fop += '/url/' + urlsafe_base64_encode(item.url);
      if (item.alias) mkzip_fop += '/alias/' + urlsafe_base64_encode(item.alias);
    }
  });

  // 如果有saveas需要曾加saveas操作
  if (options.saveas) {
    if (typeof options.saveas === 'object') {
      options.saveas = options.saveas.bucketName + ':' + options.saveas.fileName;
    }
    mkzip_fop += '|saveas/' + urlsafe_base64_encode(options.saveas);
  }

  // 如果pfop不是function，只返回fop
  if (typeof pfop !== 'function') return mkzip_fop;

  return pfop(mkzip_fop);
};
/**
 * MD转HTML
 * 官方文档：https://developer.qiniu.com/dora/manual/1285/md-html-md2html
 */
exports.md2html = function(url, options = {}){
  if (!url) return Promise.reject('url is required');
  let path = 'md2html';
  options.mode = options.mode || 0;
  path += '/' + options.mode;
  if (options.cssUrl) path += '/css/' + urlsafe_base64_encode(options.cssUrl);
  return rp({
    url: url + '?' + path
  });
};
/**
 * 资源下载二维码
 * 官方文档：https://developer.qiniu.com/dora/manual/1298/resource-download-the-qr-code-qrcode
 */
exports.qrcode = function(url, options = {}){
  if (!url) return Promise.reject('url is required');
  let path = 'qrcode';
  options.mode = options.mode || 0;
  path += '/' + options.mode;
  if (options.level) path += '/level/' + options.level;

  url += '?' + path;

  try {
    url = Extends.Image.processingFops(url, options);
  } catch (error) {
    return Promise.reject(error);
  }

  // 如果是另存操作，直接返回这个就可以
  if (options.saveas) return rp({ url, json: true, encodeURI: false });

  if (!options.path && !options.stream) return Promise.resolve(url);

  let writeStream = options.stream || fs.createWriteStream(options.path);

  return rp({ url, pipe: writeStream });
};

// 扩展Resource
Object.assign(exports, Extends.Resource);