const fs = require('fs');
const http = require('http');
const request = require('request');
const Extends = require('./extends');
const rp = require('request-promise');
const urlsafe_base64_encode = require('./encrypt/urlsafe_base64_encode');

/**
 * 图片基本信息
 * 官方文档：https://developer.qiniu.com/dora/manual/1269/pictures-basic-information-imageinfo
 */
module.exports.imageInfo = function(url){
  if (!url) return Promise.reject('url is required');
  return rp({
    url: url + '?imageInfo',
    json: true
  });
};
/**
 * 图片EXIF信息
 * 官方文档：https://developer.qiniu.com/dora/manual/1260/photo-exif-information-exif
 */
module.exports.exif = function(url){
  if (!url) return Promise.reject('url is required');
  return rp({
    url: url + '?exif',
    json: true
  });
};
/**
 * 图片平均色调
 * 官方文档：https://developer.qiniu.com/dora/manual/1268/image-average-hue-imageave
 */
module.exports.imageAve = function(url){
  if (!url) return Promise.reject('url is required');
  return rp({
    url: url + '?imageAve',
    json: true
  });
};
/**
 * 图片处理
 * @param {Object} options
 * options.imageslim 瘦身
 * options.imageView 基本处理
 * options.imageMogr 高级处理
 * options.watermark 水印
 * options.roundPic 圆角处理
 * options.saveas 处理结果另存
 */
module.exports.processing = function(url, options){
  if (!url) return Promise.reject('url is required');
  if (!options) return Promise.reject('options is required');

  try {
    url = Extends.Image.processingFops(url, options);
  } catch (error) {
    return Promise.reject(error);
  }
  
  // 如果是另存操作，直接返回这个就可以
  if (options.saveas) return rp({ url, json: true, encodeURI: false });

  // 如果没有设置本地路径或stream，会直接返回url
  if (!options.path && !options.stream) return Promise.resolve(url);

  // 下载到本地
  let writeStream = options.stream || fs.createWriteStream(options.path);
  return new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    request(url).on('error', reject).pipe(writeStream);
  });
};

// 扩展Image
Object.assign(module.exports, Extends.Image);