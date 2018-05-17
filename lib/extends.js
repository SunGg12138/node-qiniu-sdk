const fs = require('fs');
const Zone = require('./zone');
const debug = require('debug')('qiniu-sdk');
const token = require('./token');
const Image = require('./file/image');
const delegate = require('delegates');
const urlsafe_base64_encode = require('./encrypt/urlsafe_base64_encode');

/**
 * 这都是官方的接口的自定义扩展
 */


// 扩展File
module.exports.File = {
  /**
   * 封装分片上传（并发）
  */
  sliceUpload: function(options){
    if (typeof options === 'string') options = { path: options };
    else if (!options) return Promise.reject(new Error('options param is required'));
    
    if (!options.stream && !options.path) return Promise.reject(new Error('options.stream or options.path has at least one'));

    options.bucketName = this.bucketName;
    options.fileName = this.fileName;
    options.key = this.fileName;
    options.token = token.upload.call(this.sdk, options);

    let readStream = options.stream || fs.createReadStream(options.path),
        bufs = [],
        chunkSize = 0,  // 当前积累的buf大小
        fileSize = 0,  // 文件大小
        readMaxSize = 4194304,  // 官网说了4mb，4194304 = 4 * 1024 * 1024
        bufIndex = 0,  // 当前buf序号
        maxConcur = options.max || 10,  // 最大并发量
        nowConcur = 0,  // 当前并发数
        host = options.host || 'http://up-' + this.zone + '.qiniu.com',
        isReadEnd = false,  // 标记是否读完了
        ctxs = [];  // 储存所有的上传文件后的ctx

    return new Promise((resolve, reject) => {
      readStream.on('data', (chunk) => {
        chunkSize += chunk.length;
        // 把数据放入到对应序号的buffer中
        bufs[bufIndex] = bufs[bufIndex]? Buffer.concat([bufs[bufIndex], chunk]) : chunk;
        if (chunkSize >= readMaxSize) {
          // 上传这个块
          uploadChunk.call(this, bufIndex, chunkSize, resolve, reject);
          nowConcur++;  // 并发数++
          bufIndex++;  // 序号++
          chunkSize = 0;  // chunkSize初始化
          //  如果已经到最大并发了，就停止流
          if (nowConcur >= maxConcur) {
            readStream.pause();
            debug('达到最大并发量：%s，暂停可读流', nowConcur);
          }
        }
      });
      readStream.on('end', () => {
        isReadEnd = true;  // 标记已读完
        debug('最后一块数据读完，size: %s', chunkSize);
        // 如果读完了之后发现还有比4MB小的数据，说明这是最后一小块，需要上传
        if (chunkSize > 0 && chunkSize < readMaxSize) {
          // 上传这个块
          uploadChunk.call(this, bufIndex, chunkSize, resolve, reject);
          nowConcur++;  // 并发数++
        }
      });
    });
    // 上传操作
    async function uploadChunk(index, chunkSize, resolve, reject){
      try {
        // 有数据才会上传块
        if (bufs[index]) {
          let result = await this.mkblk({
            firstChunkBinary: bufs[index],
            firstChunkSize: chunkSize,
            blockSize: chunkSize,
            upload_token: options.token
          });
          debug('第%s块数据上传完成', index + 1);
          // 增加文件大小
          fileSize += chunkSize;
          // 储存ctx，按照序号放置ctx
          ctxs[index] = result.ctx;
          bufs[index] = null;  // 释放内存
          nowConcur--;  // 完成了这一次，并发数可以减1
        }
        if (isReadEnd && nowConcur === 0) {
          // 如果已经读完了准备七牛云合并文件操作
          let result = await this.mkfile({
            fileSize,
            key: options.key,
            lastCtxOfBlock: ctxs.join(','),
            upload_token: options.token
          });
          resolve(result);
        } else {
          // 如果是暂停状态的就继续读
          if (readStream.isPaused()) readStream.resume();
        }
      } catch (error) {
        if (
          error.statusCode === 401 &&
          error.error && 
          (error.error.error === 'token out of date' || error.error.error.indexOf('token expired') > -1)
        ) {
          debug('token过期，重新获取token');
          // 如果是token过期，重新生成token，继续上传
          options.token = token.upload.call(this.sdk, options);
          uploadChunk.apply(this, arguments);
        } else {
          reject(error);
        }
      }
    }
  },
  /**
   * 为File增加Image类
  */
  domain: function(domain){
    if (!this.image) {
      this.image = new Image(domain, this);
      let _delegate = delegate(this, 'image');
      Object.keys(Image.prototype).forEach(key => {
        _delegate.method(key);
      });
    }
    return this;
  },
  // 切换区域
  zone: function(zone){
    if (!Zone.zones.includes(zone)) {
      throw new Error('七牛云没有这个区域');
    }
    this.zone = zone;
    return this;
  }
};

// 扩展Bucket
module.exports.Bucket = {

  // 切换区域
  zone: function(zone){
    if (!Zone.zones.includes(zone)) {
      throw new Error('七牛云没有这个区域');
    }
    this.zone = zone;
    return this;
  }
};