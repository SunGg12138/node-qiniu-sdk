const fs = require('fs');
const Extends = require('./extends');
const rp = require('./request');
const token = require('./token');
const debug = require('debug')('qiniu-sdk');

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
  let { uri, type, detail, sdk } = options;

  // 选择的审核类型，可选项：pulp/terror/politician。默认选择全部 pulp/terror/politician
  type = type || ["pulp", "terror", "politician"];
  // 用于判断是否返回暴恐的详细分类结果。true表示返回详细分类结果，false表示不返回详细分类结果。默认是false
  detail = !!detail || false;
  
  let request_options = {
    url: 'http://argus.atlab.ai/v1/image/censor',
    method: 'POST',
    host: 'argus.atlab.ai',
    path: '/v1/image/censor',
    body: {
      data: { uri },
      params: { type, detail }
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': null
    }
  };
  // 设置Authorization
  request_options.headers.Authorization = token.qiniu.call(sdk, request_options);

  debug('图片审核：S%', request_options);

  return rp(request_options);
};

/**
 * 人脸检测
 * 官方文档：https://developer.qiniu.com/dora/manual/4281/face-detection
 * 快速检测并精准定位出图中人脸，返回人脸框坐标。返回的结果中还包含人脸概率值的score，score越高，表示检测结果的置信度越高
 * @param options.uri {String} 图片资源地址（请求图片人脸部分面积不能小于60* 60)。
 * @param options.sdk {qiniu} 本模块的实例
 */
exports.faceDetect = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.uri) return Promise.reject('options.uri is required');
  if (!options.sdk) return Promise.reject('options.sdk is required');

  // 构造请求参数和获取http请求鉴权
  let request_options = {
    url: 'http://ai.qiniuapi.com/v1/face/detect',
    host: 'ai.qiniuapi.com',
    path: '/v1/face/detect',
    method: 'POST',
    body: {
      data: {
        uri: options.uri
      }
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': null
    }
  };
  request_options.headers.Authorization = token.qiniu.call(options.sdk, request_options);

  return rp(request_options);
};

/**
 * 1:1人脸比对
 * 官方文档：https://developer.qiniu.com/dora/manual/4282/face-sim
 * 判断是否为同一人。结果返回两张图片中最大人脸框坐标、两张脸的相似度以及是否为同一人。返回的结果中还包含两张图片中人脸概率值的score，score越高，表示检测结果的置信度越高
 * @param options.uris {Array} 图片资源。支持两种资源表达方式：1. 网络图片URL地址；2. 图片 base64 编码字符串，需在编码字符串前加上前缀 data:application/octet-stream;base64, 例：data:application/octet-stream;base64,xxx
 * @param options.sdk {qiniu} 本模块的实例
 */
exports.faceSim = function(options){
  if (!options) return Promise.reject('options is required');
  if (!Array.isArray(options.uris)) return Promise.reject('options.uris must be array');
  if (!options.sdk) return Promise.reject('options.sdk is required');
  for (let i = 0, l = options.uris.length; i < l; i++) {
    if (!options.uris[i].uri) return Promise.reject('Every uri is required');
  }

  // 构造请求参数和获取http请求鉴权
  let request_options = {
    url: 'http://ai.qiniuapi.com/v1/face/sim',
    host: 'ai.qiniuapi.com',
    path: '/v1/face/sim',
    method: 'POST',
    body: {
      data: options.uris
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': null
    }
  };
  request_options.headers.Authorization = token.qiniu.call(options.sdk, request_options);

  return rp(request_options);
};

/**
 * 1:N人脸比对
 * 官方文档：https://developer.qiniu.com/dora/manual/4438/face-recognition
 * 七牛1:N人脸比对服务可对一张含有人脸的图片进行智能识别，检测出图片中的人脸后在自定义的人像库中进行人脸检索，返回最相似的一个或多个人脸信息。整个服务由多个API接口组合而成，可实现功能包括新建人像库、删除人像库、添加或删除人脸、显示所有或指定人像库信息、显示所有或指定人脸信息以及人脸搜索。适用于刷脸签到，会议签到，身份识别等多种场景。
 * 本接口可对入库图片进行质量检测，禁止模糊，大姿态等低质量人脸入库，帮助用户规范人像库图片质量，提升识别精度。人脸搜索接口可根据用户定义对检索图片中的最大人脸或者所有人脸进行识别，并且支持在多库中搜索，接口灵活度可以满足用户各种使用姿势。
 * @param options.op {String} 1:N人脸比对操作符
 * @param options.data {Object} 操作的参数
 * @param options.sdk {qiniu} 本模块的实例
 */
exports.faceGroup = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.op) return Promise.reject('options.op is required');
  if (options.op !== 'groupList' && !options.data) return Promise.reject('options.data is required');
  if (!options.sdk) return Promise.reject('options.sdk is required');

  // 获取请求参数
  let request_options;
  try {
    request_options = Extends.Image.faceGroupOp(options.op, options.data);
  } catch (error) {
    return Promise.reject(error);
  }
  request_options.headers.Authorization = token.qiniu.call(options.sdk, request_options);
  return rp(request_options);
};

/**
 * 以图搜图
 * 官方文档：https://developer.qiniu.com/dora/manual/4680/image-search
 * 七牛以图搜图服务可对一张图片在底库中进行相似图片搜索，结果返回与搜索图语义最相似的多张图片。整个服务由多个API接口组合而成，可实现功能包括新建图像库、删除图像库、添加或者删除图片、显示所有或指定图像库信息、显示所有或指定图片信息以及图片搜索。
 * @param options.op {String} 1:N人脸比对操作符
 * @param options.data {Object} 操作的参数
 * @param options.sdk {qiniu} 本模块的实例
 */
exports.imageGroup = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.op) return Promise.reject('options.op is required');
  if (options.op !== 'groupList' && !options.data) return Promise.reject('options.data is required');
  if (!options.sdk) return Promise.reject('options.sdk is required');

  // 获取请求参数
  let request_options;
  try {
    request_options = Extends.Image.imageGroupOp(options.op, options.data);
  } catch (error) {
    return Promise.reject(error);
  }
  request_options.headers.Authorization = token.qiniu.call(options.sdk, request_options);
  return rp(request_options);
};

/**
 * OCR身份证识别
 * 官方文档：https://developer.qiniu.com/dora/manual/4276/ocr-sari-idcard
 * 用户通过身份证识别接口idcard对存储在七牛云 bucket（支持华东、华北和华南 bucket）或 非七牛云 bucket 的身份证正反面图片进行智能识别，可得到身份证中姓名、性别、民族、住址和身份证号码等关键信息。目前支持的图片格式有 png、jpg 和 bmp。
 * @param options.uri {String} 身份证图片链接
 * @param options.sdk {qiniu} 本模块的实例
 */
exports.ocr = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.uri) return Promise.reject('options.uri is required');
  if (!options.sdk) return Promise.reject('options.sdk is required');

  // 构造请求参数和获取http请求鉴权
  let request_options = {
    url: 'http://ai.qiniuapi.com/v1/ocr/idcard',
    method: 'POST',
    host: 'ai.qiniuapi.com',
    path: '/v1/ocr/idcard',
    body: {
      data: {
        "uri": options.uri
      }
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': null
    }
  };
  request_options.headers.Authorization = token.qiniu.call(options.sdk, request_options);

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