const token = require('./token');
const Extends = require('./extends');
const debug = require('debug')('qiniu-sdk');
const rp = require('node-request-slim').promise;
const urlsafe_base64_encode = require('./encrypt/urlsafe_base64_encode');

/**
 * 视频三鉴
 * 官方文档：https://developer.qiniu.com/dora/manual/4258/video-pulp
 * @param {String} options.vid 调用者设置的视频唯一标识，异步处理的返回结果中会带上该信息
 * @param {qiniu} options.sdk 本模块的实例
 * @param {Object} options.body 请求参数，参数细节请看官网API
 */
exports.review = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.vid) return Promise.reject('options.vid is required');
  if (!options.body) return Promise.reject('options.body is required');
  if (!options.sdk) return Promise.reject('options.sdk is required');

  // 构造请求参数和获取http请求鉴权
  let request_options = {
    url: 'http://ai.qiniuapi.com/v1/video/' + options.vid,
    method: 'POST',
    host: 'ai.qiniuapi.com',
    path: '/v1/video/' + options.vid,
    body: options.body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': null
    }
  };
  request_options.headers.Authorization = token.qiniu.call(options.sdk, request_options);

  return rp(request_options);
};

/**
 * 获取单个视频的识别结果或者获取处理任务列表
 * 官方文档：https://developer.qiniu.com/dora/manual/4258/video-pulp
 * @param {String} job_id 指定job_id获取单个视频的识别结果
 * @param {String} status 可选，任务状态 WAITING/DOING/RESCHEDULED/FAILED/FINISHED,RESCHEDULED是指等待重试中
 * @param {qiniu} sdk 本模块实例
 */
exports.jobs = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.sdk) return Promise.reject('options.sdk is required');

  // 构造请求参数
  let request_options = {
    method: 'GET',
    host: 'ai.qiniuapi.com',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': null
    }
  };

  // 构建path和url参数
  if (options.job_id) {
    // 指定job_id后获取单个任务状态
    request_options.path = '/v1/jobs/video/' + options.job_id;
  } else {
    // 不指定任务返回所有任务状态
    request_options.path = '/v1/jobs/video';
    // 指定status返回相应状态的任务
    if (options.status) {
      request_options.path += '?status=' + options.status;
    }
  }
  request_options.url = 'http://ai.qiniuapi.com' + request_options.path;

  // 生成HTTP 请求鉴权
  request_options.headers.Authorization = token.qiniu.call(options.sdk, request_options);
  debug('video.job 请求参数：%S', request_options);

  return rp(request_options);
};

/**
 * 锐智转码
 * 官方文档：https://developer.qiniu.com/dora/manual/5135/avsmart#3
 */
exports.avsmart = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.pfop) return Promise.reject('options.pfop is required');

  // format默认是mp4
  options.format = options.format || 'mp4';
  options.oau = options.oau || '0';

  // 构建fops参数
  let fops = 'avsmart/' + options.format + '/oau/' + options.oau;

  // 如果有saveas需要曾加saveas操作
  if (options.saveas) {
    if (typeof options.saveas === 'object') {
      options.saveas = options.saveas.bucketName + ':' + options.saveas.fileName;
    }
    fops += '|saveas/' + urlsafe_base64_encode(options.saveas);
  }
  
  return options.pfop(fops);
};

/**
 * 普通音视频转码
 * 官方文档：https://developer.qiniu.com/dora/manual/1248/audio-and-video-transcoding-avthumb
 * 现在视频水印功能已经和转码avthumb功能合并，可以同时转码以及做水印。
 */
exports.avthumb = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.pfop) return Promise.reject('options.pfop is required');
  if (!options.format) return Promise.reject('options.format is required');

  // 构建fops参数
  let fops;
  try {
    fops = Extends.AV.getAvthumbFops('avthumb', options);
  } catch (error) {
    return Promise.reject(error);
  }

  // 如果有saveas需要曾加saveas操作
  if (options.saveas) {
    if (typeof options.saveas === 'object') {
      options.saveas = options.saveas.bucketName + ':' + options.saveas.fileName;
    }
    fops += '|saveas/' + urlsafe_base64_encode(options.saveas);
  }

  debug('avthumb fops: s%', fops);
  
  return options.pfop(fops);
};

/**
 * 音视频分段
 * 官方文档：https://developer.qiniu.com/dora/manual/4154/dora-segment
 */
exports.segment = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.format) return Promise.reject('options.format is required');
  if (!options.pattern) return Promise.reject('options.pattern is required');
  if (!options.pfop) return Promise.reject('options.pfop is required');

  // 构建fops参数
  let fops = 'segment/' + options.format + '/pattern/' + urlsafe_base64_encode(options.pattern);
  if (options.segtime) {
    fops += '/segtime/' + options.segtime;
  }

  // 如果有saveas需要曾加saveas操作
  if (options.saveas) {
    if (typeof options.saveas === 'object') {
      options.saveas = options.saveas.bucketName + ':' + options.saveas.fileName;
    }
    fops += '|saveas/' + urlsafe_base64_encode(options.saveas);
  }

  return options.pfop(fops);
};

/**
 * 音视频切片（HLS）
 * 官方文档：https://developer.qiniu.com/dora/manual/1485/audio-and-video-slice
 */
exports.hls = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.pfop) return Promise.reject('options.pfop is required');

  // 默认为 0
  options.noDomain = options.noDomain || '0';

  // 构建fops参数
  let fops;
  try {
    fops = Extends.AV.getAvthumbFops('avthumb/m3u8', options);
  } catch (error) {
    return Promise.reject(error);
  }

  // 如果有saveas需要曾加saveas操作
  if (options.saveas) {
    if (typeof options.saveas === 'object') {
      options.saveas = options.saveas.bucketName + ':' + options.saveas.fileName;
    }
    fops += '|saveas/' + urlsafe_base64_encode(options.saveas);
  }

  return options.pfop(fops);
};

/**
 * 视频水印
 * 官方文档：https://developer.qiniu.com/dora/manual/1314/video-watermarking
 * 现在视频水印功能已经和转码avthumb功能合并，可以同时转码以及做水印。
 */
exports.watermark = exports.avthumb;

/**
 * 音视频拼接
 * 官方文档：https://developer.qiniu.com/dora/manual/1246/audio-and-video-stitching-avconcat
 * 音视频拼接接口(avconcat)用于将指定的数个音频片段拼接成一段音频，或者将数个视频片段拼接成一段视频。
 */
exports.concat = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.format) return Promise.reject('options.format is required');
  if (!options.pfop) return Promise.reject('options.pfop is required');
  if (!Array.isArray(options.urls)) return Promise.reject('options.urls is invalid');

  // mode默认是2
  options.mode = options.mode || '2';
  // index默认是1
  options.index = options.index || '1';

  // 构建fops参数
  let fops = 'avconcat/' + options.mode + '/index/' + options.index + '/format/' + options.format;
  options.urls.forEach(item => {
    fops += urlsafe_base64_encode(item);
  });

  // 如果有saveas需要曾加saveas操作
  if (options.saveas) {
    if (typeof options.saveas === 'object') {
      options.saveas = options.saveas.bucketName + ':' + options.saveas.fileName;
    }
    fops += '|saveas/' + urlsafe_base64_encode(options.saveas);
  }
  
  return options.pfop(fops);
};

/**
 * 音视频元信息
 * 官方文档：https://developer.qiniu.com/dora/manual/1247/audio-and-video-metadata-information-avinfo
 * 音视频元信息接口(avinfo)用于获取指定音频、视频资源的元信息。
 */
exports.avinfo = function(url){
  return rp({ url: url + '?avinfo' });
};

/**
 * 视频帧缩略图
 * 官方文档：https://developer.qiniu.com/dora/manual/1313/video-frame-thumbnails-vframe
 * 视频帧缩略图接口(vframe)用于从视频流中截取指定时刻的单帧画面并按指定大小缩放成图片。
 */
exports.vframe = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.format) return Promise.reject('options.format is required');
  if (!options.offset) return Promise.reject('options.offset is required');
  if (!options.pfop) return Promise.reject('options.pfop is required');

  // 构建fops参数
  let fops = 'vframe/' + options.format + '/offset/' + options.offset;
  if (options.w) fops += '/w/' + options.w;
  if (options.h) fops += '/h/' + options.h;
  if (options.rotate) fops += '/rotate/' + options.rotate;

  // 如果有saveas需要曾加saveas操作
  if (options.saveas) {
    if (typeof options.saveas === 'object') {
      options.saveas = options.saveas.bucketName + ':' + options.saveas.fileName;
    }
    fops += '|saveas/' + urlsafe_base64_encode(options.saveas);
  }

  return options.pfop(fops);
};

/**
 * 视频采样缩略图
 * 官方文档：https://developer.qiniu.com/dora/manual/1315/video-sampling-thumbnails-vsample
 * 视频采样缩略图接口(vsample)用于从视频文件中截取多帧画面并按指定大小缩放成图片。
 */
exports.vsample = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.format) return Promise.reject('options.format is required');
  if (!options.ss) return Promise.reject('options.ss is required');
  if (!options.t) return Promise.reject('options.t is required');
  if (!options.pfop) return Promise.reject('options.pfop is required');

  // 构建fops参数
  let fops = 'vsample/' + options.format + '/ss/' + options.ss + '/t/' + options.t;
  if (options.s) fops += '/s/' + options.s;
  if (options.rotate) fops += '/rotate/' + options.rotate;
  if (options.interval) fops += '/interval/' + options.interval;
  if (options.pattern) fops += '/pattern/' + urlsafe_base64_encode(options.pattern);

  // 如果有saveas需要曾加saveas操作
  if (options.saveas) {
    if (typeof options.saveas === 'object') {
      options.saveas = options.saveas.bucketName + ':' + options.saveas.fileName;
    }
    fops += '|saveas/' + urlsafe_base64_encode(options.saveas);
  }

  return options.pfop(fops);
};

/**
 * 实时音视频转码
 * 官方文档：https://developer.qiniu.com/dora/manual/1249/real-time-audio-and-video-transcoding-avvod
 * 实时音视频转码(avvod)用于对已经上传到七牛云的音频、视频，在终端播放时按照指定参数进行实时转码。注意：该功能目前支持华东和华北的 bucket。
 */
exports.avvod = function(options){
  if (!options) return Promise.reject('options is required');

  options.format = options.format || 'm3u8';

  // 构建fops参数
  let fops = 'avvod/' + options.format;
  if (options.ab) fops += '/ab/' + options.ab;
  if (options.aq) fops += '/aq/' + options.aq;
  if (options.ar) fops += '/ar/' + options.ar;
  if (options.r) fops += '/r/' + options.r;
  if (options.vb) fops += '/vb/' + options.vb;
  if (options.vcodec) fops += '/vcodec/' + options.vcodec;
  if (options.acodec) fops += '/acodec/' + options.acodec;
  if (options.s) fops += '/s/' + options.s;
  if (options.autosave) fops += '/autosave/' + options.autosave;

  // 返回实时音视频转码(avvod)的url或fops参数
  return options.url? url + '?' + fops : fops;
};

/**
 * 多码率自适应转码
 * 官方文档：https://developer.qiniu.com/dora/manual/1245/multiple-rate-adaptive-transcoding-adapt
 * 多码率自适应转码(adapt)用于对已经上传到七牛云的视频转码成包含多种码率的HLS视频流。以便能随着终端网络带宽的变化动态选择适应的码率播放。
 */
exports.adapt = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.envBandWidth) return Promise.reject('options.envBandWidth is required');
  if (!options.pfop) return Promise.reject('options.pfop is required');

  options.format = options.format || 'm3u8';

  // 构建fops参数
  let fops = 'adapt/' + options.format + '/envBandWidth/' + options.envBandWidth;
  if (options.multiAb) fops += '/multiAb/' + options.multiAb;
  if (options.multiVb) fops += '/multiVb/' + options.multiVb;
  if (options.multiResolution) fops += '/multiResolution/' + options.multiResolution;
  if (options.multiPrefix) {
    fops += '/multiPrefix/' + options.multiPrefix.map(item => urlsafe_base64_encode(item)).join(',');
  }
  if (options.vb) fops += '/vb/' + options.vb;
  if (options.ab) fops += '/ab/' + options.ab;
  if (options.resolution) fops += '/resolution/' + options.resolution;
  if (options.hlstime) fops += '/hlstime/' + options.hlstime;

  // 如果有saveas需要曾加saveas操作
  if (options.saveas) {
    if (typeof options.saveas === 'object') {
      options.saveas = options.saveas.bucketName + ':' + options.saveas.fileName;
    }
    fops += '|saveas/' + urlsafe_base64_encode(options.saveas);
  }

  return options.pfop(fops);
};

/**
 * 私有M3U8
 * 官方文档：https://developer.qiniu.com/dora/manual/1292/private-m3u8-pm3u8
 * pm3u8 接口只能用于私有空间中的 m3u8 文件，作用是对 m3u8文件中的 ts 资源进行批量下载授权。通过将 ts 资源的 url 改写成私有 url，以临时获取访问权限。
 */
exports.pm3u8 = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.url) return Promise.reject('options.url is required');
  if (!options.pipe) return Promise.reject('options.pipe is required');
  if (!options.qiniu) return Promise.reject('options.qiniu is required');

  let M3U8DownloadURI = token.download.call(options.qiniu, options);

  // 默认是0
  options.mode = options.mode || '0';

  // 构建fops参数
  let fops = 'pm3u8/' + options.mode;
  if (options.expires) fops += '/expires/' + options.expires;
  if (options.deadline) fops += '/deadline/' + options.deadline;

  return rp({ url: M3U8DownloadURI + '&' + fops, pipe: options.pipe });
};