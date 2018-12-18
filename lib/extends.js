const fs = require('fs');
const Zone = require('./zone');
const debug = require('debug')('qiniu-sdk');
const token = require('./token');
const urlsafe_base64_encode = require('./encrypt/urlsafe_base64_encode');

/**
 * 这都是官方的接口的自定义扩展
 */

// 扩展File
exports.File = {
  /**
   * 封装分片上传（并发）
  */
  sliceUpload: function (options) {
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
        bufs[bufIndex] = bufs[bufIndex] ? Buffer.concat([bufs[bufIndex], chunk]) : chunk;
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
    async function uploadChunk(index, chunkSize, resolve, reject) {
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
  tabZone: function (zone) {
    // 不存在的区域发出警告
    Zone.warn(zone);

    this.zone = zone;
    return this;
  }
};

// 扩展Bucket
exports.Bucket = {
  tabZone: function (zone) {
    // 不存在的区域发出警告
    Zone.warn(zone);
    
    this.zone = zone;
    return this;
  }
};

// 扩展SDK
exports.SDK = {
};

// 扩展Image
exports.Image = {
  /**
   * 为processing提供获取fop的url
   * @param {String} url 
   * @param {Object} options 
   */
  processingFops: function (url, options) {
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
      url = (url.indexOf('?') > -1 ? url : url + '?') + fops;
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
  faceGroupOp: function (op, data) {
    let request_options = {
      host: 'ai.qiniuapi.com',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': null
      }
    };
    switch (op) {
      // 创建一个新的人像库并将人脸信息存入库中，返回录入人像库的人脸唯一标识
      case 'newGroup':
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
      // 删除指定的人像库，如果人像库中含有人脸也一并删除
      case 'removeGroup':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        request_options.method = 'POST';
        request_options.path = '/v1/face/group/' + group_id + '/remove';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        break;
      // 在指定人像库中添加人脸，返回新添加的人脸唯一标识
      case 'addFace':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        data.uris.forEach(item => {
          if (!item.uri) throw 'Every uri is required';
        });
        request_options.method = 'POST';
        request_options.path = '/v1/face/group/' + group_id + '/add';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          data: data.uris
        };
        break;
      // 删除指定人像库中的一个或多个人脸
      case 'deleteFace':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        var faces = data.faces;
        if (!Array.isArray(faces)) throw 'data.faces is required';
        request_options.method = 'POST';
        request_options.path = '/v1/face/group/' + group_id + '/delete';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          faces: data.faces
        };
        break;
      // 显示所有已建立的人像库的唯一id
      case 'groupList':
        request_options.method = 'GET';
        request_options.path = '/v1/face/group';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        break;
      // 显示指定人像库中人脸个数
      case 'groupInfo':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        request_options.method = 'GET';
        request_options.path = '/v1/face/group/' + group_id + '/info'
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        break;
      // 显示所有人脸
      // 显示指定的人像库中的所有人脸
      case 'faceList':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        request_options.method = 'GET';
        request_options.path = '/v1/face/group/' + group_id;
        if (data.marker || data.limit) {
          request_options.path += '?';
          data.marker && (request_options.path += 'marker=' + data.marker);
          data.limit && (request_options.path += 'limit=' + data.limit);
        }
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        break;
      // 显示某人像库中指定一张人脸信息
      case 'faceInfo':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        var id = data.id;
        if (!id) throw 'data.id is required';
        request_options.method = 'POST';
        request_options.path = '/v1/face/group/' + group_id + '/face';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          id: id
        };
        break
      // 人脸搜索
      // 对于待搜索图片中检测到的每张人脸，在指定的人像库中返回其相似度最高的多张人脸 id，注意： 支持在多个库进行搜索
      case 'search':
        var uri = data.uri;
        if (!uri) throw 'data.uri is required';
        var params = data.params;
        if (!params) throw 'data.params is required';
        request_options.method = 'POST';
        request_options.path = '/v1/face/groups/search';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          data: { uri: data.uri },
          params: data.params
        };
        break;
      // 人脸搜索（旧版本)
      // 对于待搜索图片中检测到的每张人脸，在指定的人像库中返回其相似度最高的一张人脸 id，此接口用于给在2018年7月24日之前接入的用户进行对照查看，请新用户统一使用上一行新人脸搜索接口
      case '_search':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        var uri = data.uri;
        if (!uri) throw 'data.uri is required';
        request_options.method = 'POST';
        request_options.path = '/v1/face/group/' + group_id + '/search';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          data: { uri: data.uri }
        };
        break;
      default:
        throw op + ' 不是一个正确的指令';
    }

    return request_options;
  },

  /**
   * 为imageGroup提供参数整理和数据整合
   */
  imageGroupOp: function (op, data) {
    let request_options = {
      host: 'ai.qiniuapi.com',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': null
      }
    };
    switch (op) {
      // 创建一个新的图像库并将图片信息存入库中，返回录入图片的唯一标识
      case 'newGroup':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        data.uris.forEach(item => {
          if (!item.uri) throw 'Every uri is required';
        });
        request_options.method = 'POST';
        request_options.path = '/v1/image/group/' + group_id + '/new';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          data: data.uris
        };
        break;
      // 删除指定的图像库，如果图像库中含有图片也一并删除
      case 'removeGroup':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        request_options.method = 'POST';
        request_options.path = '/v1/image/group/' + group_id + '/remove';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        break;
      // 在指定图像库中添加图片，返回新添加的图片唯一标识
      case 'addImage':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        data.uris.forEach(item => {
          if (!item.uri) throw 'Every uri is required';
        });
        request_options.method = 'POST';
        request_options.path = '/v1/image/group/' + group_id + '/add';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          data: data.uris
        };
        break;
      // 删除指定图像库中的一张或多张图片
      case 'deleteImage':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        var images = data.images;
        if (!Array.isArray(images)) throw 'data.images is required';
        request_options.method = 'POST';
        request_options.path = '/v1/image/group/' + group_id + '/delete';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          images: data.images
        };
        break;
      // 显示所有创建的图像库的唯一 id
      case 'groupList':
        request_options.method = 'GET';
        request_options.path = '/v1/image/group';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        break;
      // 显示指定图像库中图片个数
      case 'groupInfo':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        request_options.method = 'GET';
        request_options.path = '/v1/image/group/' + group_id + '/info'
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        break;
      // 显示指定的图像库中的所有图片
      case 'imageList':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        request_options.method = 'GET';
        request_options.path = '/v1/image/group/' + group_id;
        if (data.marker || data.limit) {
          request_options.path += '?';
          data.marker && (request_options.path += 'marker=' + data.marker);
          data.limit && (request_options.path += 'limit=' + data.limit);
        }
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        break;
      // 显示某图像库中指定一张图片信息
      case 'imageInfo':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        var id = data.id;
        if (!id) throw 'data.id is required';
        request_options.method = 'POST';
        request_options.path = '/v1/image/group/' + group_id + '/image';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          id: id
        };
        break
      // 图片搜索
      // 图像库搜索。在指定的图像库中，返回与待搜索图片最相似的多张图片 注意： 支持在多个库进行搜索
      case 'search':
        var uri = data.uri;
        if (!uri) throw 'data.uri is required';
        var params = data.params;
        if (!params) throw 'data.params is required';
        request_options.method = 'POST';
        request_options.path = '/v1/image/groups/search';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          data: { uri: data.uri },
          params: data.params
        };
        break;
      // 图片搜索（旧版本)
      // 图像库搜索。在指定的图像库中，返回与待搜索图片最相似的多张图片 注意： 不支持多库搜索，此接口用于给在2018年9月1日之前接入的用户进行对照查看，请新用户统一使用上一行新图片搜索接口
      case '_search':
        var group_id = data.group_id;
        if (!group_id) throw 'data.group_id is required';
        var uri = data.uri;
        if (!uri) throw 'data.uri is required';
        request_options.method = 'POST';
        request_options.path = '/v1/image/group/' + group_id + '/search';
        request_options.url = 'http://ai.qiniuapi.com' + request_options.path;
        request_options.body = {
          data: { uri: data.uri }
        };
        break;
      default:
        throw op + ' 不是一个正确的指令';
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
function getImageFop(type, options) {
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

// 扩展AV
exports.AV = {
  /**
   * avthumb: 官方文档：https://developer.qiniu.com/dora/manual/1248/audio-and-video-transcoding-avthumb
   * @param {String} type 类型
   * @param {Object} options 参数
   */
  getAvthumbFops: function(type, options){
    switch (type) {
      case 'avthumb':
        var fop = 'avthumb/' + options.format;
        if (options.ab) fop += '/ab/' + options.ab;
        if (options.aq) fop += '/aq/' + options.aq;
        if (options.ar) fop += '/ar/' + options.ar;
        if (options.r) fop += '/r/' + options.r;
        if (options.hr) fop += '/hr/' + options.hr;
        if (options.vb) fop += '/vb/' + options.vb;
        if (options.vcodec) fop += '/vcodec/' + options.vcodec;
        if (options.acodec) fop += '/acodec/' + options.acodec;
        if (options.scodec) fop += '/scodec/' + options.scodec;
        if (options.subtitle) fop += '/subtitle/' + options.subtitle;
        if (options.ss) fop += '/ss/' + options.ss;
        if (options.t) fop += '/t/' + options.t;
        if (options.s) fop += '/s/' + options.s;
        if (options.autoscale) fop += '/autoscale/' + options.autoscale;
        if (options.aspect) fop += '/aspect/' + options.aspect;
        if (options.stripmeta) fop += '/stripmeta/' + options.stripmeta;
        if (options.h264Crf) fop += '/h264Crf/' + options.h264Crf;
        if (options.h264Profile) fop += '/h264Profile/' + options.h264Profile;
        if (options.h264Level) fop += '/h264Level/' + options.h264Level;
        if (options.rotate) fop += '/rotate/' + options.rotate;
        if (options.writeXing) fop += '/writeXing/' + options.writeXing;
        if (options.an) fop += '/an/' + options.an;
        if (options.vn) fop += '/vn/' + options.vn;
        if (options.sn) fop += '/sn/' + options.sn;
        if (options.gop) fop += '/gop/' + options.gop;
        if (options.wmImage) fop += '/wmImage/' + urlsafe_base64_encode(options.wmImage);
        if (options.wmGravity) fop += '/wmGravity/' + options.wmGravity;
        if (options.wmOffsetX) fop += '/wmOffsetX/' + options.wmOffsetX;
        if (options.wmOffsetY) fop += '/wmOffsetY/' + options.wmOffsetY;
        if (options.wmText) fop += '/wmText/' + urlsafe_base64_encode(options.wmText);
        if (options.wmGravityText) fop += '/wmGravityText/' + options.wmGravityText;
        if (options.wmFont) fop += '/wmFont/' + urlsafe_base64_encode(options.wmFont);
        if (options.wmFontColor) fop += '/wmFontColor/' + urlsafe_base64_encode(options.wmFontColor);
        if (options.wmFontSize) fop += '/wmFontSize/' + options.wmFontSize;
        if (options.wmConstant) fop += '/wmConstant/' + options.wmConstant;
        return fop;
      case 'avthumb/m3u8':
        var fop = 'avthumb/m3u8/noDomain/' + options.noDomain;
        if (options.domain) fop += '/domain/' + urlsafe_base64_encode(options.domain.replace(/^http(s)?:\/\//, ''));
        if (options.segtime) fop += '/segtime/' + options.segtime;
        if (options.ab) fop += '/ab/' + options.ab;
        if (options.aq) fop += '/aq/' + options.aq;
        if (options.ar) fop += '/ar/' + options.ar;
        if (options.r) fop += '/r/' + options.r;
        if (options.vb) fop += '/vb/' + options.vb;
        if (options.vcodec) fop += '/vcodec/' + options.vcodec;
        if (options.acodec) fop += '/acodec/' + options.acodec;
        if (options.scodec) fop += '/scodec/' + options.scodec;
        if (options.subtitle) fop += '/subtitle/' + options.subtitle;
        if (options.ss) fop += '/ss/' + options.ss;
        if (options.t) fop += '/t/' + options.t;
        if (options.s) fop += '/s/' + options.s;
        if (options.stripmeta) fop += '/stripmeta/' + options.stripmeta;
        if (options.rotate) fop += '/rotate/' + options.rotate;
        if (options.hlsKey) fop += '/hlsKey/' + options.hlsKey;
        if (options.hlsKeyType) fop += '/hlsKeyType/' + options.hlsKeyType;
        if (options.hlsKeyUrl) fop += '/hlsKeyUrl/' + options.hlsKeyUrl;
        if (options.pattern) fop += '/pattern/' + urlsafe_base64_encode(options.pattern);
        return fop;
    }
  }
};