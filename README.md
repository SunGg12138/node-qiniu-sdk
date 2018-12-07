# node-qiniu-sdk

使用 ES2017 async functions 来操作七牛云，接口名称与官方接口对应，轻松上手

qiniu的官方sdk不太符合日常需要，所以有时间写了个模块，你也可去qiniu官方查看[官方SDK](https://github.com/qiniu/nodejs-sdk)

模块主要包含七牛云以下产品与服务：
  - [对象储存](https://developer.qiniu.com/kodo)
  - [融合CDN](https://developer.qiniu.com/fusion)
  - [智能多媒体API](https://developer.qiniu.com/dora)
  - [内容审核](https://developer.qiniu.com/censor)
  - [智能日志管理平台](https://developer.qiniu.com/insight)

## 安装

```bash
$ npm install node-qiniu-sdk
```

## 测试用例

目前测试用例共102个，如果api我还没有写出来，请先看对应的测试用例
DEBUG=test mocha可以查看操作返回的具体的数据

av.pm3u8接口有可能出现超时的情况

```bash
# 先配置你的/test/resource/qiniu.config.json文件再测试
# qiniu.config.json是放置AccessKey和SecretKey的配置文件
# 格式与qiniu.config.default.json相同，你需要配置你的qiniu.config.json
$ mocha

# 如果想看返回的数据信息可以加上DEBUG=test
$ DEBUG=test mocha

# 如果想看操作信息可以加上DEBUG=qiniu-sdk（例如：分片上传的步骤）
$ DEBUG=qiniu-sdk mocha
```

## 使用简介

每个方法都与官网的对应，更多方法可参考[文档](./docs)

```javascript
const Qiniu = require('node-qiniu-sdk');
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 所有的方法都返回promise，这里我就直接用await了

// 创建管理储存空间的对象
const bucket = qiniu.bucket('<存储空间名称>');

// 如果你之前没有存储空间，使用mk方法可以创建一个
await bucket.mk();

// 删除存储空间
await bucket.drop();

// 创建管理文件的对象
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 上传文件，这里会使用流的形式上传
await file.upload({ path: '<本地文件路径>' });

// 删除文件
await file.delete();
```

## 各模块功能

模块名称                 |      所属产品或服务        | 模块的功能
------------------------|----------------------|--------------------------------------
[bucket](./docs/bucket.md) | 对象储存 | 储存空间创建、设置镜像源、设置访问权限、获取空间域名、资源列举、删除
[file](./docs/file.md) | 对象储存 | 文件上传、重命名、复制、删除、修改状态、更新生命周期、修改存储类型、资源元信息查询、资源元信息修改、第三方资源抓取、镜像资源更新、分片上传
[statistic](./docs/statistic.md) | 对象储存 | 数据统计接口
[cdn](./docs/cdn.md) | 融合CDN | 日志下载、日志分析、缓存刷新、刷新查询、预取、预取查询、批量查询cdn带宽、批量查询cdn流量
[image](./docs/image.md) | 智能多媒体API | 获取图片基本信息、图片EXIF信息、图片平均色调信息，图像的瘦身处理、基本处理、高级处理、水印处理、圆角处理以及图片的审核、鉴黄、鉴暴恐、政治人物识别、人脸检测、1:1人脸比对、1:N人脸比对、以图搜图、OCR身份证识别
[av](./docs/av.md)  |  智能多媒体API | 视频三鉴、获取单个视频的识别结果、锐智转码、普通音视频转码、音视频分段、音视频切片（HLS）、视频水印、音视频拼接、音视频元信息、视频帧缩略图、视频采样缩略图、实时音视频转码、多码率自适应转码、私有M3U8
[resource](./docs/resource.md) | 智能多媒体API | 获取文件hash值、markdown转html、生成资源二维码、资源合并、资源压缩
[pandora](./docs/pandora.md) | 智能日志管理平台 | 数据推送 API
[sdk](./docs/sdk.md) | 对象储存、持久化处理、处理结果另存 | 获取Bucket列表、异步第三方资源抓取、文件批量操作、下载资源、持久化处理、处理结果另存

#### image.processing图片处理介绍

[processing处理参数详情](./docs/image.md#processing参数介绍)

```javascript
const Qiniu = require('node-qiniu-sdk');
await Qiniu.image.processing(common.url, {
  imageslim: true,  // 图片瘦身（imageslim）将存储在七牛的JPEG、PNG格式的图片实时压缩而尽可能不影响画质。
  imageView: { w: 200, h: 300 },  // 图片基本处理接口可对图片进行缩略操作，生成各种缩略图。
  imageMogr: { blur: '20x2', rotate: 45 }, // 图片高级处理接口为开发者提供了一系列高级图片处理功能，包括缩放、裁剪、旋转等。
  watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },  // 七牛云存储提供三种水印接口
  roundPic: { radius: 20 }  // 图片圆角处理

  // 不指定path、stream、saveas会返回处理语句的url

  // 指定path或stream会保存到本地（path和stream原理相同）
  // path: __dirname + '/processing.test.jpg',
  // stream: fs.createWriteStream(__dirname + '/processing.test.jpg'),

  // 指定saveas会把处理的结果保存到指定七牛云仓库
  // saveas: qiniu.saveas(common.bucketName, 'processing.jpg')
});
```
- 处理前：

<img src="http://pimnrbs1q.bkt.clouddn.com/file.image.test.jpg" width="300">

- 处理后：

由于旋转后背景色自动填充为白色，请到这个链接查看圆角效果：[链接](http://pimnrbs1q.bkt.clouddn.com/processing.test.jpg)

![处理后](http://pimnrbs1q.bkt.clouddn.com/processing.test.jpg)

## 没有使用request模块

1. 由于request模块在提交content-type为text/plain时，会对数据JSON.stringify，所以会多一对“"”分号
2. request为防止url异常会把url给eccodeURIComponent

这两点在某些请求时会出错

1.1.3版本以后使用了新写的请求模块，node-request-slim。

## 官方文档快捷方式

- [API概览](https://developer.qiniu.com/kodo/api/1731/api-overview)
- [HTTP Headers](https://developer.qiniu.com/kodo/api/3924/common-request-headers)
- [错误响应](https://developer.qiniu.com/kodo/api/3928/error-responses)
- [数据格式](https://developer.qiniu.com/kodo/api/1276/data-format)
- [HTTP Headers](https://developer.qiniu.com/kodo/api/3924/common-request-headers)

## LICENSE

MIT