const token = require('../token');
const rp = require('request-promise');
const Extends = require('../extends');

module.exports = CDN;

function CDN(sdk){
  this.sdk = sdk;
  // this.domain = new Domain(sdk);
  // this.cert = new Cert(sdk);
}

/**
 * 日志下载
 * 官方文档：https://developer.qiniu.com/fusion/api/1226/download-the-log
 * @param {String} day 日期，例如：2018-05-12
 * @param {Array} domains 域名数组
 */
CDN.prototype.log = function(day, domains){
  let options = {
    host: 'http://fusion.qiniuapi.com',
    path: '/v2/tune/log/list',
    body: {
      day,
      domains: domains.join(';')
    }
  };
  return this.sdk.rs(options);
};
/**
 * 日志分析
 * 官方文档：https://developer.qiniu.com/fusion/api/4081/cdn-log-analysis
 * @param {Object} options
 * @param {Array} options.domains 域名列表，总数不超过100条
 * @param {String} options.freq 粒度，可选项为 5min、1hour、1day
 * @param {String} options.startDate 开始时间，起止最大间隔为31天，例如：2018-05-12
 * @param {String} options.endDate 	结束时间，起止最大间隔为31天，例如：2018-05-12
 * @param {String} options.region 	区域
 */
CDN.prototype.loganalyze = function(options){
  if (!options || !options._type) return Promise.reject('options and options._type are required');

  let result = loganalyze(options._type);
  if (!result) return Promise.reject('Invalid options._type');

  // 要发送的参数
  let body = {};
  for (let i = 0, l = result.keys.length; i < l; i++) {
    let key = result.keys[i];
    if (!options[key]) return Promise.reject('Lack of parameter ' + key);
    body[key] = options[key];
  }

  let request_options = {
    host: 'http://fusion.qiniuapi.com',
    path: '/v2/tune/loganalyze' + result.path,
    body: body
  };
  return this.sdk.rs(request_options);
};
/**
 * 缓存刷新
 * 官方文档：https://developer.qiniu.com/fusion/api/1229/cache-refresh#3
 * @param {Object} options
 * @param {Array} options.urls 要刷新的单个url列表
 * @param {Array} options.dirs 要刷新的目录url列表
 */
CDN.prototype.refresh = function(options){
  if (!options) return Promise.reject('options is required');
  if (!Array.isArray(options.urls) && !Array.isArray(options.dirs)) return Promise.reject('urls or dirs has at least one');
  let request_options = {
    host: 'http://fusion.qiniuapi.com',
    path: '/v2/tune/refresh',
    body: options
  };
  return this.sdk.rs(request_options);
};
/**
 * 刷新查询
 * 官方文档：https://developer.qiniu.com/fusion/api/1229/cache-refresh#4
 * @param {Object} options
 * options.requestId	string	指定要查询记录所在的刷新请求id
 * options.isDir	string	指定是否查询目录，取值为 yes/no
 * options.urls	string	要查询的url列表，每个url可以是文件url，也可以是目录url
 * options.state	string	指定要查询记录的状态，取值processing／success／failure
 * options.pageNo	int	要求返回的页号，默认为0
 * options.pageSize	int	要求返回的页长度，默认为100
 */
CDN.prototype.refreshList = function(options){
  if (!options) return Promise.reject('options is required');
  let request_options = {
    host: 'http://fusion.qiniuapi.com',
    path: '/v2/tune/refresh/list',
    body: options
  };
  return this.sdk.rs(request_options);
};
/**
 * 预取
 * 官方文档：https://developer.qiniu.com/fusion/api/1227/file-prefetching#3
 * @param {Object} options
 * options.urls	string	要预取的单个url列表
 */
CDN.prototype.prefetch = function(options){
  if (!options || !options.urls) return Promise.reject('options or options.urls are required');
  let request_options = {
    host: 'http://fusion.qiniuapi.com',
    path: '/v2/tune/prefetch',
    body: options
  };
  return this.sdk.rs(request_options);
};
/**
 * 预取查询
 * 官方文档：https://developer.qiniu.com/fusion/api/1227/file-prefetching#4
 * @param {Object} options
 * requestId	string	指定要查询记录所在的预取请求id。
 * urls	string	要查询的url列表
 * state	string	指定要查询记录的状态，取值processing／success／failure。
 * pageNo	int	要求返回的页号，默认为0。
 * pageSize	int	要求返回的页长度，默认为100。
 */
CDN.prototype.prefetchList = function(options){
  if (!options) return Promise.reject('options is required');
  let request_options = {
    host: 'http://fusion.qiniuapi.com',
    path: '/v2/tune/prefetch/list',
    body: options
  };
  return this.sdk.rs(request_options);
};
/**
 * 批量查询 cdn 带宽
 * @param {Object} options
 * startDate	string	必须	开始日期，例如：2016-07-01
 * endDate	string	必须	结束日期，例如：2016-07-03
 * granularity	string	必须	粒度，取值：5min ／ hour ／day
 * domains	string	必须	域名列表，以 ；分割
 */
CDN.prototype.bandwidth = function(options){
  if (!options) return Promise.reject('options is required');
  if (Array.isArray(options.domains)) options.domains = options.domains.join(';');
  let request_options = {
    host: 'http://fusion.qiniuapi.com',
    path: '/v2/tune/bandwidth',
    body: options
  };
  return this.sdk.rs(request_options);
};
/**
 * 批量查询 cdn 流量
 * @param {Object} options
 * startDate	string	必须	开始日期，例如：2016-07-01
 * endDate	string	必须	结束日期，例如：2016-07-03
 * granularity	string	必须	粒度，取值：5min ／ hour ／day
 * domains	string	必须	域名列表，以 ；分割
 */
CDN.prototype.flux = function(options){
  if (!options) return Promise.reject('options is required');
  if (Array.isArray(options.domains)) options.domains = options.domains.join(';');
  let request_options = {
    host: 'http://fusion.qiniuapi.com',
    path: '/v2/tune/flux',
    body: options
  };
  return this.sdk.rs(request_options);
};

// 日志分析时
// 根据type来返回path和keys
function loganalyze(type){
  switch (type) {
    case 'statuscode':  // 批量查询状态码
      return { path: '/statuscode', keys: ['domains', 'freq', 'startDate', 'endDate'] }; 
    case 'hitmiss':  // 批量查询命中率
      return { path: '/hitmiss', keys: ['domains', 'freq', 'startDate', 'endDate'] }; 
    case 'reqcount':  // 批量查询请求次数
      return { path: '/reqcount', keys: ['domains', 'freq', 'region', 'startDate', 'endDate'] }; 
    case 'ispreqcount':  // 批量查询 ISP 请求次数
      return { path: '/ispreqcount', keys: ['domains', 'freq', 'region', 'startDate', 'endDate'] }; 
    case 'topcountip':  // 批量请求访问次数 Top IP
      return { path: '/topcountip', keys: ['domains', 'region', 'startDate', 'endDate'] }; 
    case 'toptrafficip':  // 批量请求访问流量 Top IP
      return { path: '/toptrafficip', keys: ['domains', 'region', 'startDate', 'endDate'] }; 
    case 'topcounturl':  // 批量请求访问次数 Top URL
      return { path: '/topcounturl', keys: ['domains', 'region', 'startDate', 'endDate'] }; 
    case 'toptrafficurl':  // 批量请求访问流量 Top URL
      return { path: '/toptrafficurl', keys: ['domains', 'region', 'startDate', 'endDate'] }; 
    case 'pageview':  // 批量查询 pageview
      return { path: '/pageview', keys: ['domains', 'freq', 'startDate', 'endDate'] }; 
    case 'uniquevisitor':  // 批量查询 uniquevisitor
      return { path: '/uniquevisitor', keys: ['domains', 'freq', 'startDate', 'endDate'] }; 
    default:
      return null; 
  }
}