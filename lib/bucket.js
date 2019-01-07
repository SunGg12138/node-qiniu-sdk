const Extends = require('./extends');
const Auth = require('qiniu-auth');

/**
 * 管理储存桶的类
 * @param {String} bucketName 储存桶的名字
 * @param {qiniu} sdk 本模块的实例
 */
function Bucket(bucketName, sdk){
  this.bucketName = bucketName;
  this.sdk = sdk;

  // 默认的区域为：z0(华东)
  this.zone = 'z0';
}
/**
 * 创建 Bucket
 * 官方文档：https://developer.qiniu.com/kodo/api/1382/mkbucketv2
*/
Bucket.prototype.mk = function(){
  // 安全的base64编码
  let EncodedBucketName = Auth.urlsafe_base64_encode(this.bucketName);

  let request_options = {
    path: '/mkbucketv2/' + EncodedBucketName + '/region/' + this.zone
  };

  return this.sdk.rs(request_options);
};
/**
 * 设置 Bucket 镜像源
 * https://developer.qiniu.com/kodo/api/3966/bucket-image-source
 * @param {String} srcSiteUrl 镜像源的访问域名
 * @param {String} host 回源时使用的Host头部值
 */
Bucket.prototype.image = function(srcSiteUrl, host){
  if (!srcSiteUrl) return new Promise.reject('srcSiteUrl is required');
  let EncodedSrcSiteUrl = Auth.urlsafe_base64_encode(srcSiteUrl);
  let request_options = {
    host: 'http://pu.qbox.me',
    path: '/image/' + this.bucketName + '/from/' + EncodedSrcSiteUrl
  };
  // 回源时设置Host头部值
  if (host) {
    let EncodedHost = Auth.urlsafe_base64_encode(host);
    request_options.path += '/host/' + EncodedHost;
  }
  return this.sdk.rs(request_options);
};
/**
 * 设置 Bucket 访问权限，0 公开、1 私有
 * 官方文档：https://developer.qiniu.com/kodo/api/3946/put-bucket-acl
 * @param {0||1} private 设置的权限 0 公开、1 私有
 */
Bucket.prototype.private = function(private){
  // private只能是0或1
  if (private !== 1 && private !== '1' &&
      private !== 0 && private !== '0') {
    return Promise.reject(new Error('private can only be 0 or 1: ' + private));
  }

  let bucketName = this.bucketName;

  // 构建请求参数
  let request_options = {
    host: 'http://uc.qbox.me',
    path: '/private',
    body: 'bucket=' + bucketName + '&private=' + private,
    form: {
      bucket: bucketName,
      private: private
    }
  };
  return this.sdk.rs(request_options);
};
/**
 * 获取 Bucket 空间域名
 * 官方文档：https://developer.qiniu.com/kodo/api/3949/get-the-bucket-space-domain
 */
Bucket.prototype.domain = function(){
  // 构建请求参数
  let request_options = {
    host: 'http://api.qiniu.com',
    path: '/v6/domain/list',
    query: 'tbl=' + this.bucketName,
    url: 'http://api.qiniu.com/v6/domain/list?tbl=' + this.bucketName
  };
  return this.sdk.rs(request_options);
};
/**
 * 资源列举
 * 官方文档：https://developer.qiniu.com/kodo/api/1284/list
 * @param {String} marker 上一次列举返回的位置标记，作为本次列举的起点信息。默认值为空字符串。
 * @param {String} limit 本次列举的条目数，范围为1-1000。默认值为1000。
 * @param {String} prefix 指定前缀，只有资源名匹配该前缀的资源会被列出。默认值为空字符串。
 * @param {String} delimiter 指定目录分隔符，列出所有公共前缀（模拟列出目录效果）。默认值为空字符串。
 */
Bucket.prototype.list = function(options = {}){
  // 构建请求参数
  let request_options = {
    host: 'http://rsf.qbox.me',
    path: '/list',
    method: 'GET',
    'content-type': 'application/x-www-form-urlencoded'
  };

  // 构建url的query部分，query部分是要编译成token的
  request_options.query = 'bucket=' + this.bucketName;
  options.marker && (request_options.query += '&marker=' + options.marker);
  options.limit && (request_options.query += '&limit=' + options.limit);
  options.prefix && (request_options.query += '&prefix=' + options.prefix);
  options.delimiter && (request_options.query += '&delimiter=' + options.delimiter);

  // 最后请求的url
  request_options.url = request_options.host + request_options.path + '?' + request_options.query;

  return this.sdk.rs(request_options);
};
/**
 * 删除 Bucket
 * 官方文档：https://developer.qiniu.com/kodo/api/1601/drop-bucket
 */
Bucket.prototype.drop = function(){
  let request_options = {
    path: '/drop/' + this.bucketName
  };
  return this.sdk.rs(request_options);
};

// 自定义扩展接口
Object.assign(Bucket.prototype, Extends.Bucket);

module.exports = Bucket;