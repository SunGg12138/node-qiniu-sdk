const Extends = require('./extends');
const urlsafe_base64_encode = require('./encrypt/urlsafe_base64_encode');

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

  let EncodedBucketName = urlsafe_base64_encode(this.bucketName);

  let options = {
    path: '/mkbucketv2/' + EncodedBucketName + '/region/' + this.zone
  };

  return this.sdk.rs(options);
};
/**
 * 设置 Bucket 镜像源
 * https://developer.qiniu.com/kodo/api/3966/bucket-image-source
 * @param {String} srcSiteUrl 镜像源的访问域名
 * @param {String} host 回源时使用的Host头部值
 */
Bucket.prototype.image = function(srcSiteUrl, host){
  let EncodedSrcSiteUrl = urlsafe_base64_encode(srcSiteUrl);
  let options = {
    host: 'http://pu.qbox.me',
    path: '/image/' + this.bucketName + '/from/' + EncodedSrcSiteUrl
  };
  // 官方文档不全暂不支持
  if (host) {
    let EncodedHost = urlsafe_base64_encode(host);
    options.path += '/host/' + EncodedHost;
  }
  return this.sdk.rs(options);
};
/**
 * 设置 Bucket 访问权限，0 公开、1 私有
 * 官方文档：https://developer.qiniu.com/kodo/api/3946/put-bucket-acl
 */
Bucket.prototype.private = function(private){

  // private只能是0或1
  if (private !== 1 && private !== '1' &&
      private !== 0 && private !== '0') {
    return Promise.reject(new Error('private can only be 0 or 1: ' + private));
  }

  let options = {};
  options.host = 'http://uc.qbox.me';
  options.path = '/private';
  options.body = 'bucket=' + this.bucketName + '&private=' + private;
  options.form = {
    bucket: this.bucketName,
    private: private
  };
  return this.sdk.rs(options);
};
/**
 * 获取 Bucket 空间域名
 * 官方文档：https://developer.qiniu.com/kodo/api/3949/get-the-bucket-space-domain
 */
Bucket.prototype.domain = function(){
  let options = {
    host: 'http://api.qiniu.com',
    path: '/v6/domain/list',
    query: 'tbl=' + this.bucketName,
    url: 'http://api.qiniu.com/v6/domain/list?tbl=' + this.bucketName
  };
  return this.sdk.rs(options);
};
/**
 * 资源列举
 * 官方文档：https://developer.qiniu.com/kodo/api/1284/list
 */
Bucket.prototype.list = function(options = {}){
  options.method = 'GET';
  options.host = 'http://rsf.qbox.me';
  options.path = '/list';
  options['content-type'] = 'application/x-www-form-urlencoded';

  // 拼接query
  options.query = options.query || '';
  options.query += 'bucket=' + this.bucketName;
  options.marker && (options.query += '&marker=' + options.marker);
  options.limit && (options.query += '&limit=' + options.limit);
  options.prefix && (options.query += '&prefix=' + options.prefix);
  options.delimiter && (options.query += '&delimiter=' + options.delimiter);
  options.url = options.host + options.path + '?' + options.query;
  
  return this.sdk.rs(options);
};
/**
 * 删除 Bucket
 * 官方文档：https://developer.qiniu.com/kodo/api/1601/drop-bucket
 */
Bucket.prototype.drop = function(){
  let options = {
    path: '/drop/' + this.bucketName
  };
  return this.sdk.rs(options);
};

// 自定义扩展接口
Object.assign(Bucket.prototype, Extends.Bucket);

module.exports = Bucket;