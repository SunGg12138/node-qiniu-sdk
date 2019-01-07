const fs = require('fs');
const Auth = require('qiniu-auth');
const Extends = require('./extends');
const debug = require('debug')('qiniu-sdk');
const rp = require('./request');

module.exports = File;

function File(scope, sdk){
  let bucketName_fileName = scope.split(':');
  this.bucketName = bucketName_fileName[0];
  this.fileName = bucketName_fileName[1];
  this.scope = scope;
  this.sdk = sdk;
  this.deadline = null;

  // 默认的区域为：z0(华东)
  this.zone = 'z0';
}
/**
 * 直传接口
 * 官方文档：https://developer.qiniu.com/kodo/api/1312/upload
 * @param {Object|String} options 文件上传配置或完整路径
 */
File.prototype.upload = function(options){
  if (typeof options === 'string') options = { path: options };
  else if (!options) return Promise.reject(new Error('options param is required'));
  
  if (!options.stream && !options.path && !options.txt) return Promise.reject(new Error('stream,path and txt has at least one'));

  // 附加属性
  if (options.stream || options.path) {
    // 流处理
    options.file = options.stream || fs.createReadStream(options.path);
  } else {
    // 把文本转换成二进制数据
    options.encoding = options.encoding || 'utf8';
    options.file = Buffer(options.txt, options.encoding);
  }
  options.scope = this.scope;
  options.key = this.fileName;
  options.fileName = this.fileName;
  options.token = Auth.upload_token.call(this.sdk, options);

  // 构造上传的url地址
  // 官方文档：https://developer.qiniu.com/kodo/manual/1671/region-endpoint
  // Github Pull Request: https://github.com/SunGg12138/node-qiniu-sdk/pull/2
  let upload_url = 'http://up-' + this.zone + '.qiniup.com';
  
  let request_options = {
    method: 'POST',
    url: upload_url,
    formData: options
  };

  debug('upload请求，请求参数：url=%s key=%s upload_token=%s', request_options.url, options.key, options.token);

  // 发送请求
  return rp(request_options);
};
/**
 * 创建块
 * 官方文档：https://developer.qiniu.com/kodo/api/1286/mkblk
*/
File.prototype.mkblk = function(options){

  debug('创建块：S%', options);

  if (!options || !options.firstChunkBinary || !options.firstChunkSize) {
    return Promise.reject('firstChunkBinary and firstChunkSize are required');
  }
  
  let host = options.host || `http://up-${this.zone}.qiniup.com`,
      blockSize = options.blockSize || 4194304;
  
  if (!options.upload_token) {
    options.scope = this.scope;
    options.upload_token = Auth.upload_token.call(this.sdk, options);
  }

  let request_options = {
    method: 'POST',
    url: host + '/mkblk/' + blockSize,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': options.firstChunkSize,
      'Authorization': 'UpToken ' + options.upload_token
    },
    formData: {
      firstChunkBinary: options.firstChunkBinary,
    }
  };

  debug('mkblk请求，请求参数：url=%s upload_token=%s', request_options.url, options.upload_token);

  return rp(request_options);
};
/**
 * 上传片
 * 官方文档：https://developer.qiniu.com/kodo/api/1251/bput
 */
File.prototype.bput = function(options){

  debug('上传片：S%', options);
  
  if (!options || !options.ctx || !options.nextChunkOffset ||
      !options.nextChunkBinary || !options.nextChunkSize
  ) {
    return Promise.reject('ctx, nextChunkOffset, nextChunkBinary, nextChunkSize are required');
  }
  let host = options.host || `http://up-${this.zone}.qiniup.com`;

  if (!options.upload_token) {
    options.scope = this.scope;
    options.upload_token = Auth.upload_token.call(this.sdk, options);
  }
  
  let request_options = {
    method: 'POST',
    url: host + '/bput/' + ctx + '/' + options.nextChunkOffset,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': options.nextChunkSize,
      'Authorization': 'UpToken ' + options.upload_token
    },
    formData: {
      nextChunkBinary: nextChunkBinary
    }
  };

  debug('bput请求，请求参数：S%', request_options);

  return rp(request_options);
};
/**
 * 创建文件
 * 官方文档：https://developer.qiniu.com/kodo/api/1287/mkfile
 */
File.prototype.mkfile = function(options){

  debug('创建文件：S%', options);

  if (!options || !options.fileSize || !options.lastCtxOfBlock) {
    return Promise.reject('fileSize, ctxListSize, lastCtxOfBlock are required');
  }
  
  let host = options.host || `http://up-${this.zone}.qiniup.com`;

  let url = host + '/mkfile/' + options.fileSize;

  if (!options.upload_token) {
    options.scope = this.scope;
    options.upload_token = Auth.upload_token.call(this.sdk, options);
  }

  // 配置可选参数
  if (options.key) url += '/key/' +  Auth.urlsafe_base64_encode(options.key);
  if (options.mimeType) url += '/mimeType/' +  Auth.urlsafe_base64_encode(options.mimeType);
  if (Array.isArray(options.encodedUserVars)) {
    options.encodedUserVars.forEach(user_var => {
      url += `/x:${user_var}/${Auth.urlsafe_base64_encode(user_var)}`;
    });
  }

  let request_options = {
    method: 'POST',
    url: url,
    form: options.lastCtxOfBlock,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': options.lastCtxOfBlock.length,
      'Authorization': 'UpToken ' + options.upload_token
    }
  };

  debug('mkfile请求，请求参数：url=%S', request_options);

  return rp(request_options);
};
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

  debug('copy请求，请求参数：bucket=%s fileName=%s dest=%s', this.bucketName, this.fileName, options.dest);

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

  debug('move请求，请求参数：bucket=%s fileName=%s dest=%s', this.bucketName, this.fileName, options.dest);

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

  debug('chstatus请求，请求参数：bucket=%s fileName=%s status=%s', this.bucketName, this.fileName, options.status);

  return this.sdk.rs(options);
};
/**
 * 更新文件生命周期，在deleteAfterDays天会被删除，0表示取消生命周期
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

  debug('deleteAfterDays请求，请求参数：bucket=%s fileName=%s deleteAfterDays=%s', this.bucketName, this.fileName, options.deleteAfterDays);

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

  debug('chtype请求，请求参数：bucket=%s fileName=%s type=%s', this.bucketName, this.fileName, options.type);

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

  debug('stat请求，请求参数：bucket=%s fileName=%s', this.bucketName, this.fileName);

  return this.sdk.rs(options);
}
/**
 * 资源元信息修改
 * 官方文档：https://developer.qiniu.com/kodo/api/1252/chgm
 */
File.prototype.chgm = function(mimetype, metas, conds){
  let options = {
    _type: 'chgm',
    bucket: this.bucketName,
    fileName: this.fileName,
    mimetype: mimetype,
    metas: metas,
    conds: conds
  };
  options.path = this.sdk.getOperation(options);

  debug('chgm请求，请求参数：bucket=%s fileName=%s mimetype=%s', this.bucketName, this.fileName, options.mimetype);

  return this.sdk.rs(options);
};
/**
 * 第三方资源抓取
 * 官方文档：https://developer.qiniu.com/kodo/api/1263/fetch
*/
File.prototype.fetch = function(url){
  if (!url) return Promise.reject(new Error('url param is required'));

  let _EncodedURL = Auth.urlsafe_base64_encode(url),
      _EncodedEntryURI = Auth.encodedEntryURI(this.bucketName, this.fileName),
      options = {
        path: '/fetch/' + _EncodedURL + '/to/' + _EncodedEntryURI,
        host: 'http://iovip.qbox.me'
      };

  debug('chgm请求，请求参数：bucket=%s fileName=%s url=%s', this.bucketName, this.fileName, url);

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
    fileName: this.fileName,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  };
  options.path = this.sdk.getOperation(options);

  debug('prefetch请求，请求参数：bucket=%s fileName=%s', this.bucketName, this.fileName);

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

  debug('delete请求，请求参数：bucket=%s fileName=%s', this.bucketName, this.fileName);

  return this.sdk.rs(options);
};

// 自定义扩展接口
Object.assign(File.prototype, Extends.File);
