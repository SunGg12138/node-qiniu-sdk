const fs = require('fs');
const Extends = require('./extends');
const rp = require('node-request-slim').promise;
const token = require('./token');

/**
 * 图片基本信息
 * 官方文档：https://developer.qiniu.com/dora/manual/1269/pictures-basic-information-imageinfo
 */
exports.imageInfo = function(url){
  if (!url) return Promise.reject('url is required');
  return rp({
    url: url + '?imageInfo'
  });
};
/**
 * 图片EXIF信息
 * 官方文档：https://developer.qiniu.com/dora/manual/1260/photo-exif-information-exif
 */
exports.exif = function(url){
  if (!url) return Promise.reject('url is required');
  return rp({
    url: url + '?exif'
  });
};
/**
 * 图片平均色调
 * 官方文档：https://developer.qiniu.com/dora/manual/1268/image-average-hue-imageave
 */
exports.imageAve = function(url){
  if (!url) return Promise.reject('url is required');
  return rp({
    url: url + '?imageAve'
  });
};
/**
 * 图片鉴黄
 * 官方文档：https://developer.qiniu.com/dora/manual/3701/ai-pulp
 */
exports.pulp = function(url){
  if (!url) return Promise.reject('url is required');
  return rp({
    url: url + '?qpulp'
  });
};
/**
 * 图片鉴暴恐
 * 官方文档：https://developer.qiniu.com/dora/manual/3918/terror
 */
exports.terror = function(url){
  if (!url) return Promise.reject('url is required');
  return rp({
    url: url + '?qterror'
  });
};
/**
 * 政治人物识别
 * 官方文档：https://developer.qiniu.com/dora/manual/3922/politician
 */
exports.politician = function(url){
  if (!url) return Promise.reject('url is required');
  return rp({
    url: url + '?qpolitician'
  });
};
/**
 * 图片审核 目前支持的图片格式有 png、jpg 和 bmp
 * pulp 鉴黄 /terror 鉴暴恐 /politician 政治人物识别
 * 官方文档：https://developer.qiniu.com/dora/manual/4252/image-review
 */
exports.review = function(options){
  let { uri, type, sdk } = options;
  
  let request_options = {
    method: 'POST',
    url: 'http://argus.atlab.ai/v1/image/censor',
    host: 'argus.atlab.ai',
    path: '/v1/image/censor',
    body: {
      data: { uri }
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': null
    }
  };
  // if (Array.isArray(type)) {
  //   request_options.query = 'type=' + type.join('&');
  //   request_options.body.params = { type };
  // }
  // 设置Authorization
  request_options.headers.Authorization = token.qiniu.call(sdk, request_options);

  return rp(request_options);
};
/**
 * 图片处理
 * 官方文档：https://developer.qiniu.com/dora/manual/3683/img-directions-for-use
 * @param {Object} options
 * options.imageslim 瘦身，图片瘦身（imageslim）将存储在七牛的JPEG、PNG格式的图片实时压缩而尽可能不影响画质。注意：该功能暂时只支持华东 bucket。
 * options.imageView 基本处理，图片基本处理接口可对图片进行缩略操作，生成各种缩略图。imageView2 接口可支持处理的原图片格式有 psd、jpeg、png、gif、webp、tiff、bmp。 
 * options.imageMogr 高级处理，图片高级处理接口为开发者提供了一系列高级图片处理功能，包括缩放、裁剪、旋转等。imageMogr2 接口可支持处理的原图片格式有 psd、jpeg、png、gif、webp、tiff、bmp。
 * options.watermark 水印，七牛云存储提供三种水印接口：图片水印接口、文字水印接口，以及一次请求中同时打多个图文水印接口。
 * options.roundPic 圆角处理
 * options.saveas 处理结果另存
 */
exports.processing = function(url, options){
  if (!url) return Promise.reject('url is required');
  if (!options) return Promise.reject('options is required');

  try {
    url = Extends.Image.processingFops(url, options);
  } catch (error) {
    return Promise.reject(error);
  }
  
  // 如果是另存操作，直接返回这个就可以
  if (options.saveas) return rp({ url });

  // 如果没有设置本地路径或stream，会直接返回url
  if (!options.path && !options.stream) return Promise.resolve(url);

  // 下载到本地
  let writeStream = options.stream || fs.createWriteStream(options.path);

  return rp({ url, pipe: writeStream });
};

// 扩展Image
Object.assign(exports, Extends.Image);