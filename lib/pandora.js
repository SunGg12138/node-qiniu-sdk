const token = require('./token');
const rp = require('node-request-slim').promise;

module.exports = Pandora;

// 智能日志管理平台
function Pandora(sdk){
  this.sdk = sdk;
  this.origin = 'https://nb-pipeline.qiniuapi.com';
};

/**
 * 数据推送
 * @param {String} repoName 字段名称
 * @param {Array} content 数据内容
 */
Pandora.prototype.repo = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.repoName) return Promise.reject('options.repoName is required');
  if (!options.content) return Promise.reject('options.content is required');

  // 构建数据内容
  let body = '';
  options.content.forEach(item => {
    for (let key in item) {
      body += key + '=' + item[key] + '\t';
    }
    body += '\n';
  });
  
  // 构建请求参数，设置api签名
  let request_options = {
    method: 'POST',
    path: '/v2/repos/' + options.repoName + '/data',
    headers: {
      'content-type': 'text/plain'
    },
    body: body
  };
  request_options.url = 'https://nb-pipeline.qiniuapi.com' + request_options.path;
  // 生成api签名
  request_options.headers['Authorization'] = token.pandora.call(this.sdk, request_options);

  return rp(request_options);
};

/**
 * 查看所有消息队列
 */
Pandora.prototype.repos = function(){
  // 构建请求参数，设置api签名
  let request_options = {
    method: 'GET',
    path: '/v2/repos',
    headers: {}
  };
  request_options.url = this.origin + request_options.path;
  request_options.headers['Authorization'] = token.pandora.call(this.sdk, request_options);

  return rp(request_options);
};