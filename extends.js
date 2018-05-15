const fs = require('fs');
const Zone = require('./zone');
const debug = require('debug')('qiniu-sdk');
const token = require('./lib/token');
const urlsafe_base64_encode = require('./lib/urlsafe_base64_encode');

/**
 * 这都是官方的接口的自定义扩展
 */


// 扩展File
module.exports.File = {
  /**
   * 封装分片上传
   */
  sliceUpload: function(options){
    if (typeof options === 'string') options = { path: options };
    else if (!options) return Promise.reject(new Error('options param is required'));
    
    if (!options.stream && !options.path) return Promise.reject(new Error('options.stream or options.path has at least one'));

    // 附加属性
    options.bucketName = this.bucketName;
    options.fileName = this.fileName;
    options.key = this.fileName;
    options.token = token.upload.call(this.sdk, options);

    let readStream = options.stream || fs.createReadStream(options.path),  // 可读流
        buf = null,  // 当前读取的buff总数据
        readMaxSize = 4194304,  // 官网说了4mb，4194304 = 4 * 1024 * 1024
        fileSize = 0, // 文件大小
        bufSize = 0,  // 当前读取的buff的长度
        host = options.host || 'http://up-' + this.zone + '.qiniu.com',
        isReadEnd = false,  // 标记是否读完了
        ctxs = [],  // 储存所有的上传文件后的ctx
        result; // 每次请求响应的结果
    
    return new Promise((resolve, reject) => {
      readStream.on('data', async (chunk) => {
        bufSize += chunk.length;
  
        // 合并buffer
        buf = buf? Buffer.concat([buf, chunk]) : chunk;
  
        if (bufSize >= readMaxSize) {

          debug('第%s块数据读完，size: %s', ctxs.length + 1, bufSize);

          // 停止可读流，上传到七牛云
          readStream.pause();
  
          // 增加文件大小
          fileSize += bufSize;
  
          try {
            // mkblk
            result = await this.mkblk({
              firstChunkBinary: buf,
              firstChunkSize: bufSize,
              blockSize: bufSize,
              upload_token: options.token
            });

            // 储存ctx并初始化buf、bufSize
            ctxs.push(result.ctx);
            buf = null;
            bufSize = 0;
  
            // 如果已经读完了准备七牛云合并文件操作，否则继续文件
            if (isReadEnd) {
              // 这是刚好读完的情况
              result = await this.mkfile({
                fileSize,
                key: options.key,
                lastCtxOfBlock: ctxs.join(','),
                upload_token: options.token
              });
              resolve(result);
            } else {
              // 继续读
              readStream.resume();
            }
          } catch (error) {
            reject(error);
          }
        }
      });
      readStream.on('end', async () => {
        isReadEnd = true;

        debug('最后一块数据读完，size: %s', bufSize);
  
        // 如果读完了之后发现还有比4MB小的数据，说明这是最后一小块，需要上传
        if (bufSize > 0 && bufSize < readMaxSize) {
  
          // 增加文件大小
          fileSize += bufSize;
  
          try {
            // 把最后一小块上传
            result = await this.mkblk({
              blockSize: bufSize,
              firstChunkBinary: buf,
              firstChunkSize: bufSize,
              upload_token: options.token
            });

            ctxs.push(result.ctx);
  
            // 创建文件
            result = await this.mkfile({
              fileSize,
              key: options.key,
              lastCtxOfBlock: ctxs.join(','),
              upload_token: options.token
            });
  
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
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

// 扩展sdk
module.exports.sdk = {
};