const fs = require('fs');
const Zone = require('./zone');
const debug = require('debug')('qiniu-sdk');
const token = require('./token');
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
        host = options.host || 'http://up-' + this.zone + '.qiniup.com',
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
  // 切换区域
  tabZone: function(zone){
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
  tabZone: function(zone){
    if (!Zone.zones.includes(zone)) {
      throw new Error('七牛云没有这个区域');
    }
    this.zone = zone;
    return this;
  }
};

// 扩展SDK
module.exports.SDK = {

  // saveas
  saveas: function(bucket, fileName){
    return (url) => {
      return token.saveas.call(this, url, bucket, fileName);
    }
  }
};

// 扩展Image
module.exports.Image = {
  /**
   * 为processing提供获取fop的url
   * @param {String} url 
   * @param {Object} options 
   */
  processingFops: function(url, options){
    // 参数判断
    if (!options) options = url, url = null;

    let { imageslim, imageView, imageMogr, watermark, roundPic, saveas } = options;
    let fops = [];

    imageslim && fops.push(getImageFop('imageslim', imageslim));
    imageView && fops.push(getImageFop('imageView', imageView));
    imageMogr && fops.push(getImageFop('imageMogr', imageMogr));
    watermark && fops.push(getImageFop('watermark', watermark));
    roundPic && fops.push(getImageFop('roundPic', roundPic));

    fops = fops.join('|');

    if (url) {
      // 生成url
      url = (url.indexOf('?') > -1? url : url + '?') + fops;
      // 处理结果另存，saveas = null，防止内存泄漏
      if (saveas) url = saveas(url), saveas = null;
    } else {
      // url是空时，返回fops就可以了
      url = fops;
    }
    return url;
  },

  /**
   * 为faceGroup提供参数整理和数据整合
   */
  faceGroupOp: function(op, data){
    let request_options = {
      host: 'ai.qiniuapi.com',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': null
      }
    };
    switch (op) {
      // 创建一个新的人像库并将人脸信息存入库中，返回录入人像库的人脸唯一标识
      case 'new':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        data.uris.forEach(item => {
          if (!item.uri) throw 'Every uri is required';
        });
        request_options.method = 'POST';
        request_options.path = '/v1/face/group/' + group_id + '/new';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          data: data.uris
        };
        break;
    }

    return request_options;
  }
};
// 获取处理指令
// 官方文档：https://developer.qiniu.com/dora/manual/1204/processing-mechanism
// imageView 官方文档：https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2
// imageMogr 官方文档：https://developer.qiniu.com/dora/manual/1270/the-advanced-treatment-of-images-imagemogr2
// watermark 官方文档：https://developer.qiniu.com/dora/manual/1316/image-watermarking-processing-watermark
// roundPic 官方文档：https://developer.qiniu.com/dora/manual/4083/image-rounded-corner
function getImageFop(type, options){
  switch (type) {
    case 'imageslim':
      var fop = 'imageslim';
      return fop;
    case 'imageView':
      var fop = 'imageView';
      if (options.w || options.h) {
        fop += '/' + (options.model || 0);
        if (options.w) fop += '/w/' + options.w;
        if (options.h) fop += '/h/' + options.h;
      }
      if (options.format) fop += '/format/' + options.format;
      if (options.interlace) fop += '/interlace/' + options.interlace;
      if (options.q) fop += '/q/' + options.q;
      if (options.ignoreError) fop += '/ignore-error/' + options.ignoreError;
      return fop;
    case 'imageMogr':
      var fop = 'imageMogr2/auto-orient';
      if (options.thumbnail) fop += '/thumbnail/' + options.thumbnail;
      if (options.strip) fop += '/strip';
      if (options.gravity) fop += '/gravity' + options.gravity;
      if (options.crop) fop += '/crop/' + options.crop;
      if (options.rotate) fop += '/rotate/' + options.rotate;
      if (options.format) fop += '/format/' + options.format;
      if (options.blur) fop += '/blur/' + options.blur;
      if (options.interlace) fop += '/interlace/' + options.interlace;
      if (options.quality) fop += '/quality/' + options.quality;
      if (options.sharpen) fop += '/sharpen/' + options.sharpen;
      if (options.sizeLimit) fop += '/size-limit/' + options.sizeLimit;
      return fop;
    case 'watermark':
      if (!options.image) throw new Error('watermark.image is required');
      var fop = 'watermark/1/image/' + urlsafe_base64_encode(options.image);
      if (options.dissolve) fop += '/dissolve' + options.dissolve;
      if (options.gravity) fop += '/gravity/' + options.gravity;
      if (options.dx) fop += '/dx/' + options.dx;
      if (options.dy) fop += '/dy/' + options.dy;
      if (options.scale) fop += '/ws/' + options.scale;
      return fop;
    case 'roundPic':
      var fop = 'roundPic';
      if (options.radius) fop += '/radius/' + options.radius;
      if (options.radiusx) fop += '/radiusx/' + options.radiusx;
      if (options.radiusy) fop += '/radiusy/' + options.radiusy;
      return fop;
  }
}