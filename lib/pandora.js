const rp = require('./request');
const Auth = require('qiniu-auth');

module.exports = Pandora;

/**
 * 智能日志管理平台
 * 官方文档：https://developer.qiniu.com/insight
 */ 
function Pandora(sdk){
  this.sdk = sdk;
};

/**
 * 数据推送
 * 官方文档：https://developer.qiniu.com/insight/api/4749/data-push-api
 * @param {String} repoName 消息队列名称
 * @param {Array} content 数据内容
 */
Pandora.prototype.send = function(options){
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
  request_options.headers['Authorization'] = Auth.pandora.call(this.sdk, request_options);

  return rp(request_options);
};