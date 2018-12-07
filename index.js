const fs = require('fs');
const File = require('./lib/file');
const CDN = require('./lib/cdn');
const Bucket = require('./lib/bucket');
const image = require('./lib/image');
const av = require('./lib/av');
const resource = require('./lib/resource');
const Statistic = require('./lib/statistic');
const Pandora = require('./lib/pandora');
const Extends = require('./lib/extends');
const token = require('./lib/token');
const debug = require('debug')('qiniu-sdk');
const rp = require('node-request-slim').promise;
const querystring = require('querystring');
const EncodedEntryURI = require('./lib/encrypt/EncodedEntryURI');
const urlsafe_base64_encode = require('./lib/encrypt/urlsafe_base64_encode');
const Zone = require('./lib/zone');

module.exports = SDK;

/**
 * SDK类
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
// image类部分api需要持久化处理或处理结果另存
SDK.image = image;
// 创建resource类
// resource类部分api需要持久化处理或处理结果另存
SDK.resource = resource;
// 创建av类
// av类部分api需要持久化处理或处理结果另存
SDK.av = av;

/**
 * 创建Bucket类
 * @param {String} bucketName 储存桶名称
 */
SDK.prototype.bucket = function(bucketName){
  return new Bucket(bucketName.toString(), this);
};
/**
 * 创建File类
 * @param {String} scope 储存桶名称和文件名称的组合
 */
SDK.prototype.file = function(scope){
  return new File(scope, this);
};
/**
 * 创建Statistic类
 */
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
 * 创建Pandora类
 * 官方文档：https://developer.qiniu.com/insight
 */
SDK.prototype.pandora = function(){
  return new Pandora(this);
};
/**
 * 异步第三方资源抓取
 * 官方文档：https://developer.qiniu.com/kodo/api/4097/asynch-fetch
 * @param {String} options.zone 可选，异步任务的区域，默认为z0（华东地区）
 * @param {Object} options.body 异步第三方资源抓取的请求体
 * @param {String||Array} options.body.url 需要抓取的url,支持设置多个,以';'分隔
 * @param {String} options.body.host 可选，从指定url下载数据时使用的Host
 * @param {String} options.body.bucket 所在区域的bucket
 * @param {String} options.body.key 可选，文件存储的key,不传则使用文件hash作为key
 * @param {String} options.body.md5 可选，文件md5,传入以后会在存入存储时对文件做校验，校验失败则不存入指定空间
 * @param {String} options.body.etag 可选，文件etag,传入以后会在存入存储时对文件做校验，校验失败则不存入指定空间,相关算法参考 https://github.com/qiniu/qetag
 * @param {String} options.body.callbackurl 可选，回调URL，详细解释请参考上传策略中的callbackUrl（https://developer.qiniu.com/kodo/manual/1206/put-policy#put-policy-callback-url）
 * @param {String} options.body.callbackbody 可选，回调Body，如果callbackurl不为空则必须指定。与普通上传一致支持魔法变量，详细解释请参考上传策略中的callbackBody
 * @param {String} options.body.callbackbodytype 可选，回调Body内容类型,默认为"application/x-www-form-urlencoded"，详细解释请参考上传策略中的callbackBodyType
 * @param {String} options.body.callbackhost 可选，回调时使用的Host
 * @param {String} options.body.file_type 可选，存储文件类型 0:正常存储(默认),1:低频存储
 * @param {String} options.body.ignore_same_key 可选，如果空间中已经存在同名文件则放弃本次抓取(仅对比Key，不校验文件内容)
*/
SDK.prototype.sisyphus = function(options){
  if (!options) return Promise.reject('options is required');
  if (!options.body) return Promise.reject('options.body is required');
  if (!options.body.url) return Promise.reject('options.body.url is required');

  // 如果url是数组，使用';'分隔
  if (Array.isArray(options.body.url)) options.body.url = options.body.url.join(';');
  
  // 默认是华东地区
  options.zone = options.zone || 'z0';

  // 不存在的区域发出警告
  Zone.warn(options.zone);

  // 构建请求参数
  let request_options = {
    url: 'http://api-' + options.zone + '.qiniu.com/sisyphus/fetch',
    host: 'api-' + options.zone + '.qiniu.com',
    path: '/sisyphus/fetch',
    method: 'POST',
    body: options.body,
    headers: {
      'Authorization': null,
      'Content-Type': 'application/json'
    }
  };
  // 生成HTTP 请求鉴权
  request_options.headers['Authorization'] = token.qiniu.call(this, request_options);

  return rp(request_options);
};

/**
 * 查看异步第三方资源抓取的状态
 * 官方文档：https://developer.qiniu.com/kodo/api/4097/asynch-fetch
 * @param {String} id 异步任务id
 * @param {String} zone 可选，异步任务的区域，默认为z0（华东地区）
 */
SDK.prototype.sisyphusStatus = function(id, zone){
  if (!id) return Promise.reject('id is required');

  // 默认是华东地区
  zone = zone || 'z0';

  // 不存在的区域发出警告
  Zone.warn(zone);

  // 构建请求参数
  let request_options = {
    url: 'http://api-' + zone + '.qiniu.com/sisyphus/fetch?id=' + id,
    host: 'api-' + zone + '.qiniu.com',
    path: '/sisyphus/fetch',
    method: 'GET',
    query: 'id=' + id,
    headers: {
      'Authorization': null,
      'Content-Type': 'application/json'
    }
  };
  // 生成HTTP 请求鉴权
  request_options.headers['Authorization'] = token.qiniu.call(this, request_options);

  return rp(request_options);
};

/**
 * 批量操作
 * 官方文档：https://developer.qiniu.com/kodo/api/1250/batch
 * @param {Array} options.ops 操作符集合
 * @param {String} options.ops.$._type 操作符类型，目前支持：delete、move、copy、chstatus、deleteAfterDays、chtype、stat、prefetch、chgm
 */
SDK.prototype.batch = function(options){
  if (!options) return Promise.reject('options is required');
  if (!Array.isArray(options.ops) || options.ops.length === 0)
    return Promise.reject('options.ops must be an array and options.ops is not an empty array');

  let request_options = {
    host: 'http://rs.qiniu.com',
    path: '/batch'
  };
  
  try {
    // 转换成['<Operation>', '<Operation>',...]的数组
    let ops = options.ops.map(item => {
      return this.getOperation(item);
    });
    request_options.form = request_options.body = querystring.stringify({op: ops});
  } catch (error) {
    return Promise.reject(error);
  }

  return this.rs(request_options);
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
 * @param {Boolean} isForce 是否强制执行（如果仓库中已经有相同的名字了，是否覆盖） 
 * @param {String} notifyURL 用户接收视频处理结果的接口 URL。设置 persistentOps 字段时，本字段必须同时设置。未来该设置项将改为可选，如未设置，则只能使用返回的 persistentId 主动查询处理进度。
 * @return {Function} 返回一个函数，可以发出指定持久化处理命令
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
  };

  return run;
};

/**
 * 处理结果另存
 * 官方文档：https://developer.qiniu.com/dora/manual/1305/processing-results-save-saveas
 * @param {String} bucket 储存桶名称
 * @param {String} fileName 文件名称
 */
SDK.prototype.saveas = function (bucket, fileName) {
  return (url) => {
    return token.saveas.call(this, url, bucket, fileName);
  }
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
      throw('无效的批量操作符 ' + options._type);
  }
};

/**
 * Tool: 开发者可以使用上传时返回的persistentId来随时查询数据处理的状态
 * 官方文档：https://developer.qiniu.com/dora/manual/3686/pfop-directions-for-use#3
 * @param {String} persistentId 处理的任务id
 */
SDK.prototype.fopStatus = SDK.fopStatus = function(persistentId){
  return rp({ url: 'http://api.qiniu.com/status/get/prefop?id=' + persistentId });
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

  // 发送请求
  return rp(request_options);
};

// 扩展SDK
Object.assign(SDK.prototype, Extends.SDK);