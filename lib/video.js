const rp = require('node-request-slim').promise;
const token = require('./token');
const debug = require('debug')('qiniu-sdk');

/**
 * 视频三鉴
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
 * 获取单个视频的识别结果
 */
exports.job = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.job_id) return Promise.reject('options.job_id is required');
  if (!options.sdk) return Promise.reject('options.sdk is required');

  // 构造请求参数
  let request_options = {
    url: 'http://ai.qiniuapi.com/v1/jobs/video/' + options.job_id,
    method: 'GET',
    host: 'ai.qiniuapi.com',
    path: '/v1/jobs/video/' + options.job_id,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': null
    }
  };
  request_options.headers.Authorization = token.qiniu.call(options.sdk, request_options);
  debug('video.job 请求参数：%S', request_options);

  return rp(request_options);
};