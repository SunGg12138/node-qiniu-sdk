## Bucket 使用预览

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 所有的方法都返回promise，这里我就直接用await了

// 创建可管理的储存空间对象并切换区域，区域默认是z0
const bucket = qiniu.bucket('<存储空间名称>').tabZone('z1');

// 如果你没有该名称的储存空间，使用mk方法会创建一个
// 官方文档：https://developer.qiniu.com/kodo/api/1382/mkbucketv2
await bucket.mk();

// 设置 Bucket 镜像源
// 官方文档：https://developer.qiniu.com/kodo/api/3966/bucket-image-source
// 参数srcSiteUrl：镜像源的访问域名，必须设置为形如http(s)://source.com或http(s)://114.114.114.114的字符串
// 参数host: 回源时使用的Host头部值(暂不支持)
await bucket.image('http://p0vquqra2.bkt.clouddn.com');

// 设置 Bucket 访问权限，0 公开、1 私有
// 官方文档：https://developer.qiniu.com/kodo/api/3946/put-bucket-acl
await bucket.private(1);

// 获取 Bucket 空间域名
// 官方文档：https://developer.qiniu.com/kodo/api/3949/get-the-bucket-space-domain
let domain = await bucket.domain();

// 对 Bucket 进行资源列举
// 还可根据参数来设置分页什么的：
// marker		上一次列举返回的位置标记，作为本次列举的起点信息。默认值为空字符串。
// limit		本次列举的条目数，范围为1-1000。默认值为1000。
// prefix		指定前缀，只有资源名匹配该前缀的资源会被列出。默认值为空字符串。
// delimiter		指定目录分隔符，列出所有公共前缀（模拟列出目录效果）。默认值为空字符串。
// 官方文档：https://developer.qiniu.com/kodo/api/1284/list
let list = await bucket.list({ limit: 100 });

// 删除 Bucket
// 官方文档：https://developer.qiniu.com/kodo/api/1601/drop-bucket
await bucket.drop();
```

## Bucket 使用详情

### bucket.tabZone(zone) 选择和切换区域

有1个参数：
  - zone(必选): String类型，空间及文件的所在区域

目前的区间z0, z1, z2, na0, as0，你可以在zone.js文件[查看详情](../zone.js)

tabZone方法不会返回promise，会直接返回Bucket对象

```javascript
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 区域默认是z0，如果你的区域不是z0，需要使用zone切换
bucket.tabZone('z1');
```

### bucket.mk() 创建bucket

[官方文档](https://developer.qiniu.com/kodo/api/1382/mkbucketv2)

没有参数

```javascript
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 创建名为<存储空间名称>的空间
await bucket.mk();
```

### bucket.image(srcSiteUrl, host) 设置Bucket镜像源

[官方文档](https://developer.qiniu.com/kodo/api/3966/bucket-image-source)

有2个参数：
  - srcSiteUrl(必选): String类型，镜像源的访问域名
  - host(可选): String类型，回源时使用的Host头部值

```javascript
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 设置镜像源为http://p0vquqra2.bkt.clouddn.com对应的空间
await bucket.image('http://p0vquqra2.bkt.clouddn.com');
```

### bucket.private(private) 设置Bucket访问权限

[官方文档](https://developer.qiniu.com/kodo/api/3946/put-bucket-acl)

有1个参数：
  - private(必选): 0或1，0 公开、1 私有

```javascript
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 设置区间为私有
await bucket.private(1);
```

### bucket.domain() 获取Bucket空间域名

[官方文档](https://developer.qiniu.com/kodo/api/3949/get-the-bucket-space-domain)

没有参数

```javascript
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 获取区间对应的域名
await bucket.domain();
```

### bucket.list(options) 对区间进行资源列举

[官方文档](https://developer.qiniu.com/kodo/api/1284/list)

options有4个参数属性：
  - marker(可选): 上一次列举返回的位置标记，作为本次列举的起点信息。默认值为空字符串。
  - limit(可选): 本次列举的条目数，范围为1-1000。默认值为1000。
  - prefix(可选): 指定前缀，只有资源名匹配该前缀的资源会被列出。默认值为空字符串。
  - delimiter(可选): 指定目录分隔符，列出所有公共前缀（模拟列出目录效果）。默认值为空字符串。

```javascript
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 进行资源列举
await bucket.list({ limit: 50 });
```

### bucket.drop() 删除区间

[官方文档](https://developer.qiniu.com/kodo/api/1601/drop-bucket)

没有参数

```javascript
// 创建可管理的文件对象
const bucket = qiniu.bucket('<存储空间名称>');

// 删除空间
await bucket.drop();
```