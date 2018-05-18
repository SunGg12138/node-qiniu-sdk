const fs = require('fs');
const request = require('request');
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
 */
module.exports.processing = function(url, options){
  if (!url) return Promise.reject('url is required');
  if (!options) return Promise.reject('options is required');
  
  let { imageslim, imageView, imageMogr, watermark, roundPic, saveas } = options;
  let fops = [];
  try {
    imageslim && fops.push(getFop('imageslim', imageslim));
    imageView && fops.push(getFop('imageView', imageView));
    imageMogr && fops.push(getFop('imageMogr', imageMogr));
    watermark && fops.push(getFop('watermark', watermark));
    roundPic && fops.push(getFop('roundPic', roundPic));
  } catch (error) {
    return Promise.reject(error);
  }
  fops = fops.join('|');
  // 生成url
  url = url + '?' + fops;

  // 处理结果另存，saveas = null，防止内存泄漏
  if (saveas) {
    url = saveas(url), saveas = null;
    return rp({ url, json: true });
  }

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
// 获取处理指令
// 官方文档：https://developer.qiniu.com/dora/manual/1204/processing-mechanism
// imageView 官方文档：https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2
// imageMogr 官方文档：https://developer.qiniu.com/dora/manual/1270/the-advanced-treatment-of-images-imagemogr2
// watermark 官方文档：https://developer.qiniu.com/dora/manual/1316/image-watermarking-processing-watermark
// roundPic 官方文档：https://developer.qiniu.com/dora/manual/4083/image-rounded-corner
function getFop(type, options){
  switch (type) {
    case 'imageslim':
      var fop = 'imageslim';
      return fop;
    case 'imageView':
      var fop = 'imageView';
      if (options.w || options.h) {
        fop += '/' + (options.model || 0);
        if (options.w) fop += '/w/' + options.w;
        if (options.h) fop += '/h/' + options.h;
      }
      if (options.format) fop += '/format/' + options.format;
      if (options.interlace) fop += '/interlace/' + options.interlace;
      if (options.q) fop += '/q/' + options.q;
      if (options.ignoreError) fop += '/ignore-error/' + options.ignoreError;
      return fop;
    case 'imageMogr':
      var fop = 'imageMogr2/auto-orient';
      if (options.thumbnail) fop += '/thumbnail/' + options.thumbnail;
      if (options.strip) fop += '/strip';
      if (options.gravity) fop += '/gravity' + options.gravity;
      if (options.crop) fop += '/crop/' + options.crop;
      if (options.rotate) fop += '/rotate/' + options.rotate;
      if (options.format) fop += '/format/' + options.format;
      if (options.blur) fop += '/blur/' + options.blur;
      if (options.interlace) fop += '/interlace/' + options.interlace;
      if (options.quality) fop += '/quality/' + options.quality;
      if (options.sharpen) fop += '/sharpen/' + options.sharpen;
      if (options.sizeLimit) fop += '/size-limit/' + options.sizeLimit;
      return fop;
    case 'watermark':
      if (!options.image) throw new Error('watermark.image is required');
      var fop = 'watermark/1/image/' + urlsafe_base64_encode(options.image);
      if (options.dissolve) fop += '/dissolve' + options.dissolve;
      if (options.gravity) fop += '/gravity/' + options.gravity;
      if (options.dx) fop += '/dx/' + options.dx;
      if (options.dy) fop += '/dy/' + options.dy;
      if (options.scale) fop += '/ws/' + options.scale;
      return fop;
    case 'roundPic':
      var fop = 'roundPic';
      if (options.radius) fop += '/radius/' + options.radius;
      if (options.radiusx) fop += '/radiusx/' + options.radiusx;
      if (options.radiusy) fop += '/radiusy/' + options.radiusy;
      return fop;
  }
}