const fs = require('fs')
const path = require('path')
const token = require('./lib/token');
const debug = require('debug')('dev');
const rp = require('request-promise');
const EncodedEntryURI = require('./lib/EncodedEntryURI');
const urlsafe_base64_encode = require('./lib/urlsafe_base64_encode');

module.exports = File;

function File(scope, sdk){
  let bucketName_fileName = scope.split(':');
  this.bucketName = bucketName_fileName[0];
  this.fileName = bucketName_fileName[1];
  this.scope = scope;
  this.sdk = sdk;
  this.deadline = null;
}
/**
 * 直传接口
 * 官方文档：https://developer.qiniu.com/kodo/api/1312/upload
 * @param {Object|String} options 文件上传配置或完整路径
 */
File.prototype.upload = function(options){
  if (!options) return Promise.reject(new Error('options param is required'));
  if (typeof options === 'object') {
    if (!options.path) return Promise.reject(new Error('options.path is required'));
  } else {
    let path = options;
    options = { path: path };
  }

  // 附加属性
  options.file = fs.createReadStream(options.path);
  options.bucket = this.bucketName;
  options.key = options.fileName = this.fileName;
  options.token = token.upload.call(this.sdk, options);

  // 发送请求
  return rp({
    method: 'POST',
    url: 'http://up.qiniu.com',
    formData: options,
    json: true
  });
};
/**
 * 删除接口
 * 官方文档：https://developer.qiniu.com/kodo/api/1257/delete
 */
File.prototype.delete = function(){

  let options = {
    _type: 'delete',
    bucket: this.bucketName,
    fileName: this.fileName
  };
  options.path = this.sdk.getOperation(options);

  return this.sdk.rs(options);
};
/**
 * 创建块
 * 官方文档：https://developer.qiniu.com/kodo/api/1286/mkblk
*/
File.prototype.mkblk = function(options){
  if (!options || !options.firstChunkBinary || !options.firstChunkSize) {
    return Promise.reject('firstChunkBinary and firstChunkSize are required');
  }
  options.scope = this.scope;

  let host = options.host || 'http://up.qiniu.com',
      blockSize = options.blockSize || 4194304,
      upload_token = options.upload_token || token.upload.call(this.sdk, options);

  return rp({
    method: 'POST',
    url: host + '/mkblk/' + blockSize,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': options.firstChunkSize,
      'Authorization': 'UpToken ' + upload_token
    },
    json: true,
    formData: {
      firstChunkBinary: options.firstChunkBinary,
    }
  });
};
/**
 * 上传片
 * 官方文档：https://developer.qiniu.com/kodo/api/1251/bput
 */
File.prototype.bput = function(options){
  if (!options || !options.ctx || !options.nextChunkOffset ||
      !options.nextChunkBinary || !options.nextChunkSize
  ) {
    return Promise.reject('ctx, nextChunkOffset, nextChunkBinary, nextChunkSize are required');
  }
  let host = options.host || 'http://up.qiniu.com',
      upload_token = options.upload_token || token.upload.call(this.sdk, options);

  return rp({
    method: 'POST',
    url: host + '/bput/' + ctx + '/' + options.nextChunkOffset,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': options.nextChunkSize,
      'Authorization': 'UpToken ' + upload_token
    },
    json: true,
    formData: {
      nextChunkBinary: nextChunkBinary
    }
  });
};
/**
 * 创建文件
 * 官方文档：https://developer.qiniu.com/kodo/api/1287/mkfile
 */
File.prototype.mkfile = function(options){
  if (!options || !options.fileSize || !options.ctxListSize ||
      !options.lastCtxOfBlock
  ) {
    return Promise.reject('fileSize, ctxListSize, lastCtxOfBlock are required');
  }
  
  let host = options.host || 'http://up.qiniu.com',
      upload_token = options.upload_token || token.upload.call(this.sdk, options);

  let url = host + '/mkfile/' + fileSize;

  // 配置可选参数
  if (options.key) url += '/key/' +  urlsafe_base64_encode(options.key);
  if (options.mimeType) url += '/mimeType/' +  urlsafe_base64_encode(options.mimeType);
  if (Array.isArray(options.encodedUserVars)) {
    options.encodedUserVars.forEach(user_var => {
      url += `/x:${user_var}/${urlsafe_base64_encode(user_var)}`;
    });
  }
  return rp({
    method: 'POST',
    url: url,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': lastCtxOfBlock.length,
      'Authorization': 'UpToken ' + upload_token
    },
    json: true,
    formData: {
      lastCtxOfBlock: lastCtxOfBlock
    }
  });
};
/**
 * 封装了创建块、上传片、创建文件3个接口
 */
File.prototype.sliceUpload = function(){};
/**
 * 资源复制
 * 官方文档：https://developer.qiniu.com/kodo/api/1254/copy
*/
File.prototype.copy = function(dest, isForce){
  let options = {
    _type: 'copy',
    bucket: this.bucketName,
    fileName: this.fileName,
    dest: dest,
    force: !!isForce
  };
  options.path = this.sdk.getOperation(options);
  return this.sdk.rs(options);
};
/**
 * 资源移动／重命名
 * 官方文档：https://developer.qiniu.com/kodo/api/1288/move
*/
File.prototype.move = function(dest, isForce){
  let options = {
    _type: 'move',
    bucket: this.bucketName,
    fileName: this.fileName,
    dest: dest,
    force: !!isForce
  };
  options.path = this.sdk.getOperation(options);
  return this.sdk.rs(options);
};
/**
 * 修改文件状态，0表示启用；1表示禁用
 * 官方文档：https://developer.qiniu.com/kodo/api/4173/modify-the-file-status
 */
File.prototype.chstatus = function(status){
  // status只能是0或1
  if (status !== 1 && status !== '1' &&
    status !== 0 && status !== '0') {
    return Promise.reject(new Error('status can only be 0 or 1: ' + status));
  }
  let options = {
    _type: 'chstatus',
    bucket: this.bucketName,
    fileName: this.fileName,
    status: status
  };
  options.path = this.sdk.getOperation(options);

  return this.sdk.rs(options);
};
/**
 * 更新文件生命周期，在deleteAfterDays天会被删除，0表示取消生命周期  没有报错，但是控制台无生命周期
 * 官方文档：https://developer.qiniu.com/kodo/api/1732/update-file-lifecycle
 */
File.prototype.deleteAfterDays = function(deleteAfterDays){
  if (!(deleteAfterDays >= 0 || Number(deleteAfterDays) >= 0)) return Promise.reject(new Error('deleteAfterDays must >= 0'));
  let options = {
    _type: 'deleteAfterDays',
    bucket: this.bucketName,
    fileName: this.fileName,
    deleteAfterDays: deleteAfterDays
  };
  options.path = this.sdk.getOperation(options);

  return this.sdk.rs(options);
};
/**
 * 修改文件存储类型，0 表示标准存储；1 表示低频存储
 * 官方文档：https://developer.qiniu.com/kodo/api/3710/chtype
 */
File.prototype.chtype = function(type){
  // type只能是0或1
  if (type !== 1 && type !== '1' &&
    type !== 0 && type !== '0') {
    return Promise.reject(new Error('type can only be 0 or 1: ' + type));
  }

  let options = {
    _type: 'chtype',
    bucket: this.bucketName,
    fileName: this.fileName,
    type: type
  };
  options.path = this.sdk.getOperation(options);

  return this.sdk.rs(options);
};
/**
 * 资源元信息查询
 * 官方文档：https://developer.qiniu.com/kodo/api/1308/stat
 */
File.prototype.stat = function(){
  let options = {
    _type: 'stat',
    bucket: this.bucketName,
    fileName: this.fileName
  };
  options.path = this.sdk.getOperation(options);

  return this.sdk.rs(options);
}
/**
 * 资源元信息修改  待完善
 * 官方文档：https://developer.qiniu.com/kodo/api/1252/chgm
 */
File.prototype.chgm = function(options){
  options._type = 'chgm';
  options.bucket = this.bucketName;
  options.fileName = this.fileName;
  options.path = this.sdk.getOperation(options);
  return this.sdk.rs(options);
};
/**
 * 第三方资源抓取
 * 官方文档：https://developer.qiniu.com/kodo/api/1263/fetch
*/
File.prototype.fetch = function(url){
  if (!url) return Promise.reject(new Error('url param is required'));

  let _EncodedURL = urlsafe_base64_encode(url),
      _EncodedEntryURI = EncodedEntryURI(this.bucketName, this.fileName),
      options = {
        path: '/fetch/' + _EncodedURL + '/to/' + _EncodedEntryURI,
        host: 'http://iovip.qbox.me'
      };

  return this.sdk.rs(options);
};
/**
 * 镜像资源更新
 * 官方文档：https://developer.qiniu.com/kodo/api/1293/prefetch
*/
File.prototype.prefetch = function(){
  let options = {
    _type: 'prefetch',
    host: 'http://iovip.qbox.me',
    bucket: this.bucketName,
    fileName: this.fileName
  };
  options.path = this.sdk.getOperation(options);
  return this.sdk.rs(options);
};
/**
 * 删除接口
 * 官方文档：https://developer.qiniu.com/kodo/api/1257/delete
 */
File.prototype.delete = function(){

  let options = {
    _type: 'delete',
    bucket: this.bucketName,
    fileName: this.fileName
  };
  options.path = this.sdk.getOperation(options);

  return this.sdk.rs(options);
};