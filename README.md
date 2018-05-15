# node-qiniu-sdk

使用Promise，方法、参数名称都严格与官方文档同步

qiniu的官方sdk不太符合日常需要，所以有时间写了个模块，你也可去qiniu官方查看[官方SDK](https://github.com/qiniu/nodejs-sdk)

## 安装

```bash
$ npm install node-qiniu-sdk
```

## 简单使用介绍

每个方法都与官网的对应

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

更多方法可参考[文档](./docs)

## 测试

```bash
# 先配置你的/test/resource/qiniu.config.json文件再测试
# qiniu.config.json是放置AccessKey和SecretKey的配置文件
# 格式与qiniu.config.default.json相同，你需要配置你的qiniu.config.json
# tip:别忘了把qiniu.config.default.json的名字改成qiniu.config.json
$ mocha

# 如果想看返回的数据信息也可以加上DEBUG
$ DEBUG=test mocha
```

## package.json

由于request在post提交文本时，也会JSON.stringify，所以会多一对“"”分号，在某些操作会出现异常
现在的request引用的是我fork后修改过的，request模块我commit了，等待merge

```javascript
...
"dependencies": {
  "debug": "^3.1.0",
  "request": "https://github.com/SunGg12138/request.git",
  "request-promise": "^4.2.2"
},
...
```

## 先说哪些接口还没实现吧，有时间再实现或大家帮帮忙

1. 数据统计接口 [官方文档](https://developer.qiniu.com/kodo/api/3906/statistic-interface)
2. 融合CDN/域名管理 [官方文档](https://developer.qiniu.com/fusion)

## 官方文档快捷方式

- [API概览](https://developer.qiniu.com/kodo/api/1731/api-overview)
- [HTTP Headers](https://developer.qiniu.com/kodo/api/3924/common-request-headers)
- [错误响应](https://developer.qiniu.com/kodo/api/3928/error-responses)
- [数据格式](https://developer.qiniu.com/kodo/api/1276/data-format)
- [HTTP Headers](https://developer.qiniu.com/kodo/api/3924/common-request-headers)