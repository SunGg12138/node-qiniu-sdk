const fs = require('fs');
const File = require('./lib/file');
const CDN = require('./lib/cdn');
const Bucket = require('./lib/bucket');
const image = require('./lib/image');
const resource = require('./lib/resource');
const Statistic = require('./lib/statistic');
const Extends = require('./lib/extends');
const token = require('./lib/token');
const debug = require('debug')('qiniu-sdk');
const rp = require('node-request-slim').promise;
const querystring = require('querystring');
const EncodedEntryURI = require('./lib/encrypt/EncodedEntryURI');
const urlsafe_base64_encode = require('./lib/encrypt/urlsafe_base64_encode');

module.exports = SDK;

/**
 * 
 * @param {String} AccessKey 
 * @param {String} SecretKey 
 */
function SDK(AccessKey, SecretKey){
  if (!AccessKey || !SecretKey) throw new Error('Both AccessKey and SecretKey are required');
  this.AccessKey = AccessKey;
  this.SecretKey = SecretKey;

  // cdn是相同的，只会创建一次
  Object.defineProperty(this, 'cdn', {
    get: function(){
      if (!this._cdn) this._cdn = new CDN(this);
      return this._cdn;
    }
  });
}
// 创建image类
// image类是不需要token的，所以可以当做SDK的属性
SDK.image = image;
// 创建resource类
// resource类是不需要token的，所以可以当做SDK的属性
SDK.resource = resource;

// 创建Bucket类
SDK.prototype.bucket = function(bucketName){
  return new Bucket(bucketName.toString(), this);
};
// 创建File类
SDK.prototype.file = function(scope){
  return new File(scope, this);
};
// 创建Statistic类
SDK.prototype.statistic = function(){
  return new Statistic(this);
};
/**
 * 获取 Bucket 列表
 * 官方文档：https://developer.qiniu.com/kodo/api/3926/get-service
*/
SDK.prototype.buckets = function(){
  let options = {
    host: 'http://rs.qbox.me',  // 指定特定的请求域名
    path: '/buckets'  // 指定请求的path
  };
  return this.rs(options);
};
/**
 * 异步第三方资源抓取
 * 官方文档：https://developer.qiniu.com/kodo/api/4097/asynch-fetch
*/
SDK.prototype.sisyphus = function(options){
  if (typeof options !== 'object')
    return Promise.reject(new Error('options param must be an Object'));
  if (typeof options.body !== 'object')
    return Promise.reject(new Error('options.body param must be an Object'));
  
  // 默认是华东地区
  options.zone = options.zone || 'z0';

  // 生成HTTP 请求鉴权
  options.path = '/sisyphus/fetch';
  options.host = 'api-' + options.zone + '.qiniu.com';
  options.method = 'POST';
  options['Content-Type'] = 'application/json';
  if (Array.isArray(options.body.url)) options.body.url = options.body.url.join(';');
  let qiniu_token = token.qiniu.call(this, options);

  return rp({
    method: 'POST',
    url: 'http://api-' + options.zone + '.qiniu.com' + options.path,
    headers: {
      'Authorization': qiniu_token,
      'content-type': 'application/json'
    },
    body: options.body
  });
};
/**
 * 批量操作
 * 官方文档：https://developer.qiniu.com/kodo/api/1250/batch
 */
SDK.prototype.batch = function(options){
  if (!Array.isArray(options.ops) || options.ops.length === 0)
    return Promise.reject(new Error('options.ops must be an array and options.ops is not an empty array'));

  options.host = 'http://rs.qiniu.com';
  options.path = '/batch';
  
  try {
    // 转换成['<Operation>', '<Operation>',...]的数组
    let ops = options.ops.map(item => {
      return this.getOperation(item);
    });
    options.form = options.body = querystring.stringify({op: ops});
  } catch (error) {
    return Promise.reject(error);
  }

  return this.rs(options);
};
/**
 * 下载资源
 * 官方文档：https://developer.qiniu.com/kodo/manual/1232/download-process
 * @param {String} options.url 必选，下载的链接
 * @param {String} options.path 可选，下载到本地的路径
 * @param {Stream} options.stream 可选，下载的流
 * @param {Object} options.range 可选，分片下载的区域，用户可以在下载时设定该字段，指定只下载该资源的一部分内容
 * @param {String || Number} options.range.start 指定只下载该资源的一部分内容的开始位置
 * @param {String || Number} options.range.end 指定只下载该资源的一部分内容的结束位置
 * @param {Boolean} options.isPublic 可选，是否是公开资源，默认是false
*/
SDK.prototype.download = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.url) return Promise.reject('options.url is required');

  let { url, path, stream, range, isPublic } = options;

  stream = stream? stream : (path? fs.createWriteStream(path) : null);

  // 如果是公开资源，直接请求下载资源
  if (isPublic) return rp({ url, pipe: stream });

  // 私有资源需要获取下载token下载

  let RealDownloadUrl = token.download.call(this, { url: url });

  debug('私有资源下载完整url：' + RealDownloadUrl);

  let request_options = {
    url: RealDownloadUrl,
    method: 'GET',
    pipe: stream
  };

  // 分片下载，用户可以在下载时设定该字段，指定只下载该资源的一部分内容
  if (range) {
    request_options.headers = {
      'Range': `bytes=${range.start}-${range.end}`
    };
  }

  return rp(request_options);
};
/**
 * 持久化处理
 * 官方文档：https://developer.qiniu.com/dora/manual/3686/pfop-directions-for-use
 */
SDK.prototype.pfop = function(options){
  options.host = 'http://api.qiniu.com';
  options.path = '/pfop';
  options.body = 'bucket=' + options.bucketName + 
                 '&key=' + options.fileName;

  // force参数、notifyURL参数
  if (options.isForce) options.body += '&force=1';
  if (options.notifyURL) options.body += '&notifyURL=' + options.notifyURL;

  let run = (fops) => {
    debug('fops字符串: %s', fops);
    
    if (fops) options.body += '&fops=' + fops;

    options.form = options.body;

    // 因为是闭包，防止内存泄漏
    run = null;

    return this.rs(options);
  }

  return run;
};
/**
 * Tool: 获取资源操作指令，只针对可批量操作的功能
*/
SDK.prototype.getOperation = function(options){
  switch (options._type) {
    case 'delete':
      return '/delete/' + EncodedEntryURI(options.bucket, options.fileName);
    case 'move':
      var EncodedEntryURISrc = EncodedEntryURI(options.bucket, options.fileName);
      var EncodedEntryURIDest = EncodedEntryURI(options.bucket, options.dest);
      var force = !!options.force;
      return '/move/' + EncodedEntryURISrc + '/' + EncodedEntryURIDest + '/force/' + force;
    case 'copy': 
      var EncodedEntryURISrc = EncodedEntryURI(options.bucket, options.fileName);
      var EncodedEntryURIDest = EncodedEntryURI(options.bucket, options.dest);
      var force = !!options.force;
      // 指定请求的path
      return '/copy/' + EncodedEntryURISrc + '/' + EncodedEntryURIDest + '/force/' + force;
    case 'chstatus': 
      // 指定请求的path
      return '/chstatus/' + EncodedEntryURI(options.bucket, options.fileName) + '/status/' + options.status;
    case 'deleteAfterDays': 
      return '/deleteAfterDays/' + EncodedEntryURI(options.bucket, options.fileName) + '/' + options.deleteAfterDays;
    case 'chtype': 
      return '/chtype/' + EncodedEntryURI(options.bucket, options.fileName) + '/type/' + options.type;
    case 'stat': 
      return '/stat/' + EncodedEntryURI(options.bucket, options.fileName);
    case 'prefetch':
      return '/prefetch/' + EncodedEntryURI(options.bucket, options.fileName);
    case 'chgm':
      var encodedEntryURI = EncodedEntryURI(options.bucket, options.fileName);
      var operation = '/chgm/' + encodedEntryURI;
      options.mimetype && (operation += '/mime/' + urlsafe_base64_encode(options.mimetype));

      // /x-qn-meta-<meta_key>/<EncodedMetaValue>
      if (Array.isArray(options.metas)) {
        options.metas.forEach(meta => {
          operation += '/x-qn-meta-' + meta.key + '/' + urlsafe_base64_encode(meta.value);
        });
      }
      // /cond/<Encodedcond>
      if (options.cond) operation += '/cond/' + urlsafe_base64_encode(options.cond);

      return operation;
    default:
      throw new Error('Invalid _type: ' + options._type);
  }
};
/**
 * Tool: 管理系列统一发送请求
 */
SDK.prototype.rs = function(options){
  // 生成管理凭证
  let access_token = options.access_token || token.access.call(this, options);

  // 构造请求配置
  let request_options = {
    method: options.method || 'POST',
    url: options.url || (options.host || 'http://rs.qiniu.com') + options.path,
    headers: {
      'Authorization': 'QBox ' + access_token
    }
  };

  if (options.form) {
    request_options.form = options.form;
  } else if (options.body) {
    request_options.body = typeof options.body === 'string'? options.body : JSON.stringify(options.body);
  } else {
    request_options.form = {};
  }
  
  // 设置content-type
  if (options['content-type']) {
    request_options.headers['content-type'] = options['content-type'];
  }

  console.log(request_options)

  // 发送请求
  return rp(request_options);
};

// 扩展SDK
Object.assign(SDK.prototype, Extends.SDK);