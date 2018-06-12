# node-qiniu-sdk

使用Promise来操作七牛云，接口名称与官方接口对应

qiniu的官方sdk不太符合日常需要，所以有时间写了个模块，你也可去qiniu官方查看[官方SDK](https://github.com/qiniu/nodejs-sdk)

## 安装

```bash
$ npm install node-qiniu-sdk
```

## 简单使用介绍

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

## 测试

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

## 各模块功能

模块名称                 | 模块的功能
------------------------|-------------------------------------
[bucket](./doc/bucket.md) | 储存空间创建、设置镜像源、设置访问权限、获取空间域名、资源列举、删除
[file](./doc/file.md) | 文件上传、重命名、复制、删除、修改状态、更新生命周期、修改存储类型、资源元信息查询、资源元信息修改、第三方资源抓取、镜像资源更新、分片上传
[cdn](./doc/cdn.md) | 日志下载、日志分析、缓存刷新、刷新查询、预取、预取查询、批量查询cdn带宽、批量查询cdn流量
[image](./doc/image.md) | 获取图片基本信息、图片EXIF信息、图片平均色调信息，图像的瘦身处理、基本处理、高级处理、水印处理、圆角处理以及图片的审核、鉴黄、鉴暴恐、政治人物识别
[resource](./doc/resource.md) | 获取文件hash值、markdown转html、生成资源二维码、资源合并、资源压缩
[sdk](./doc/sdk.md) | 获取Bucket列表、异步第三方资源抓取、文件批量操作、下载资源、持久化处理

## package.json

1. 由于request提交content-type为text/plain时，会JSON.stringify，所以会多一对“"”分号
2. request为防止url异常会把url给eccodeURIComponent

这两点在某些请求时会出错，所以作了些修改

现在的request引用的是我fork后修改过的，request模块我提交了我的代码，等待merge

```javascript
...
"dependencies": {
  "debug": "^3.1.0",
  "request": "https://github.com/SunGg12138/request.git",
  "request-promise": "^4.2.2"
},
...
```

## 官方文档快捷方式

- [API概览](https://developer.qiniu.com/kodo/api/1731/api-overview)
- [HTTP Headers](https://developer.qiniu.com/kodo/api/3924/common-request-headers)
- [错误响应](https://developer.qiniu.com/kodo/api/3928/error-responses)
- [数据格式](https://developer.qiniu.com/kodo/api/1276/data-format)
- [HTTP Headers](https://developer.qiniu.com/kodo/api/3924/common-request-headers)

## LICENSE

MIT License

Copyright (c) 2018 Grand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.