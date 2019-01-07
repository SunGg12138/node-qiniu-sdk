# sdk

- [sdk.sisyphus 异步第三方资源抓取](#异步第三方资源抓取)
- [sdk.buckets 获取储存空间列表](#获取储存空间列表)
- [sdk.sisyphusStatus 查看异步第三方资源抓取的状态](#查看异步第三方资源抓取的状态)
- [sdk.batch 批量操作](#批量操作)
- [sdk.download 下载资源](#下载资源)

### 异步第三方资源抓取

sdk.sisyphus(options);

[官方文档](https://developer.qiniu.com/kodo/api/4097/asynch-fetch)

options对象 有2个参数属性：
  - zone: string类型，可选，异步任务的区域，默认为z0（华东地区）
  - body: object类型，必选，body有12个属性
    - url: string类型，必选，需要抓取的url,支持设置多个,以';'分隔
    - host: string类型，可选，从指定url下载数据时使用的Host
    - bucket: string类型，可选，所在区域的bucket
    - key: string类型，可选，文件存储的key,不传则使用文件hash作为key
    - md5: string类型，可选，文件md5,传入以后会在存入存储时对文件做校验，校验失败则不存入指定空间
    - etag: string类型，可选，文件etag,传入以后会在存入存储时对文件做校验，校验失败则不存入指定空间,相关算法参考 https://github.com/qiniu/qetag
    - callbackurl: string类型，可选，回调URL，详细解释请参考上传策略中的callbackUrl
    - callbackbody: string类型，可选，回调Body，如果callbackurl不为空则必须指定。与普通上传一致支持魔法变量，详细解释请参考上传策略中的[callbackBody](https://developer.qiniu.com/kodo/manual/1206/put-policy#put-policy-callback-url)
    - callbackbodytype: string类型，可选，回调Body内容类型,默认为"application/x-www-form-urlencoded"，详细解释请参考上传策略中的callbackBodyType
    - callbackhost: string类型，可选，回调时使用的Host
    - file_type: string类型，可选，存储文件类型 0:正常存储(默认),1:低频存储
    - ignore_same_key: string类型，可选，如果空间中已经存在同名文件则放弃本次抓取(仅对比Key，不校验文件内容)

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

await qiniu.sisyphus({
  zone: 'z0',
  body: {
    url: 'https://raw.githubusercontent.com/SunGg12138/node-qiniu-sdk-resource/master/file.image.test.jpg;https://raw.githubusercontent.com/SunGg12138/node-qiniu-sdk-resource/master/processing.test.jpg',
    bucket: '<存储空间名称>',
    // 还可以指定其他参数，比如：
    // key: '文件的名字.jpg',  // 设置储存后的名称
    // file_type: 1,         // 设置为低频存储
  }
});
```

### 获取储存空间列表

qiniu.buckets();

没有参数

[官方文档](https://developer.qiniu.com/kodo/api/3926/get-service)

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

await qiniu.buckets();
```

### 查看异步第三方资源抓取的状态

sdk.sisyphusStatus(id, zone);

[官方文档](https://developer.qiniu.com/kodo/api/4097/asynch-fetch)

有2个参数：
  - id: String类型，必选，异步任务id
  - zone: String类型，可选，异步任务的区域，默认为z0（华东地区）

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// id是执行异步第三方资源抓取时返回的id
await qiniu.sisyphusStatus(id, zone);
```

### 批量操作

sdk.batch(options);

[官方文档](https://developer.qiniu.com/kodo/api/1250/batch)

options有一个参数：
  - ops: array，必选，表示操作的指令集合

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

/**
 * 操作指令：
 *   _type：必选，标记操作类型
 *   bucket：必选，储存空间名称
 *   fileName：必选，操作文件的名字
 *   其它可选的参数和正常文件操作的参数一致
*/
await qiniu.batch({
  ops: [
    { _type: 'move', bucket: common.bucketName, fileName: 'test.png', dest: 'test-1.png', force: false },
    { _type: 'copy',bucket: common.bucketName,fileName: 'test2.png',dest: 'test-2.png',force: false },
    { _type: 'chtype', bucket: common.bucketName, fileName: 'test3.png', type: 1 },
    { _type: 'stat', bucket: common.bucketName, fileName: 'test-1.png' },
    { _type: 'delete', bucket: common.bucketName,fileName: 'test.js' }
  ]
});
```

### 下载资源

sdk.download(options);

[官方文档](https://developer.qiniu.com/kodo/manual/1232/download-process)

options有5个参数：
  - url: string，必选，资源的url
  - path: string，可选，资源的url
  - stream: 可选，文件下载pipe到指定流
  - isPublic: 可选，是否是公开资源，默认是false
  - range: 可选，object，分片下载的区域，用户可以在下载时设定该字段，指定只下载该资源的一部分内容，range有两个参数
    - start: string，分片下载的片的开始位置
    - end: string，分片下载的片的结束位置

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 下载私有资源
await qiniu.download({
  url: 'http://***.com/test.png',
  path: __dirname + '/test.png',
  range: { start: 0, end: 10 }
});

// 下载公共资源可以不用设置'<Your AccessKey>', '<Your SecretKey>'
await Qiniu.prototype.download({
  url: 'http://***.com/test.png',
  path: __dirname + '/test.png',
  isPublic: true
});
```