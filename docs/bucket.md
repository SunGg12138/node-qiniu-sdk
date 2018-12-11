## bucket 储存空间操作

- [bucket.tabZone 切换储存空间区域](#切换储存空间区域)
- [bucket.mk 创建储存空间](#创建储存空间)
- [bucket.image 设置储存空间镜像源](#设置储存空间镜像源)
- [bucket.private 设置储存空间访问权限](#设置储存空间访问权限)
- [bucket.domain 获取储存空间的域名](#获取储存空间的域名)
- [bucket.list 对储存空间进行资源列举](#对储存空间进行资源列举)
- [bucket.drop 删除储存区间](#删除储存区间)

### 切换储存空间区域

bucket.tabZone(zone);

有1个参数：
  - zone(必选): String类型，空间及文件的所在区域

目前的区间z0, z1, z2, na0, as0，你可以在zone.js文件[查看详情](../zone.js)

tabZone方法不会返回promise，会直接返回Bucket对象

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 区域默认是z0，如果你的区域不是z0，需要使用zone切换
bucket.tabZone('z1');

bucket.tabZone('z1') === bucket;  // true, tabZone是链式调用，返回this
```

### 创建储存空间

bucket.mk();

[官方文档](https://developer.qiniu.com/kodo/api/1382/mkbucketv2)

没有参数

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 创建名为<存储空间名称>的空间
await bucket.mk();
```

### 设置储存空间镜像源

bucket.image(srcSiteUrl, host);

[官方文档](https://developer.qiniu.com/kodo/api/3966/bucket-image-source)

有2个参数：
  - srcSiteUrl(必选): String类型，镜像源的访问域名
  - host(可选): String类型，回源时使用的Host头部值

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 设置镜像源为http://p0vquqra2.bkt.clouddn.com对应的空间
await bucket.image('http://p0vquqra2.bkt.clouddn.com');
```

### 设置储存空间访问权限

bucket.private(private);

[官方文档](https://developer.qiniu.com/kodo/api/3946/put-bucket-acl)

有1个参数：
  - private(必选): 0或1，0 公开、1 私有

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 设置区间为私有
await bucket.private(1);
```

### 获取储存空间的域名

bucket.domain();

[官方文档](https://developer.qiniu.com/kodo/api/3949/get-the-bucket-space-domain)

没有参数

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 获取区间对应的域名
await bucket.domain();
```

### 对储存空间进行资源列举

bucket.list(options);

[官方文档](https://developer.qiniu.com/kodo/api/1284/list)

options有4个参数属性：
  - marker(可选): 上一次列举返回的位置标记，作为本次列举的起点信息。默认值为空字符串。
  - limit(可选): 本次列举的条目数，范围为1-1000。默认值为1000。
  - prefix(可选): 指定前缀，只有资源名匹配该前缀的资源会被列出。默认值为空字符串。
  - delimiter(可选): 指定目录分隔符，列出所有公共前缀（模拟列出目录效果）。默认值为空字符串。

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 进行资源列举
await bucket.list({ limit: 50 });
```

### 删除储存区间

bucket.drop();

[官方文档](https://developer.qiniu.com/kodo/api/1601/drop-bucket)

没有参数

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 删除空间
await bucket.drop();
```