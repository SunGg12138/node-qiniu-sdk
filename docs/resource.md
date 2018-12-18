## resource 资源操作

- [resource.qhash 文件HASH值](#文件HASH值)
- [resource.concat 文本文件合并](#文本文件合并)
- [resource.mkzip 多文件压缩](#多文件压缩)
- [resource.md2html MD转HTML](#MD转HTML)
- [resource.qrcode 资源下载二维码](#资源下载二维码)

### 文件HASH值

resource.qhash(url, algorithm);

[官方文档](https://developer.qiniu.com/dora/manual/1297/file-hash-value-qhash)

有两个参数：
  - url: string，必选，储存空间文件的url
  - algorithm: string，可选，计算 hash 的算法。目前支持sha1和md5。默认是sha1

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 不需要设置'<Your AccessKey>', '<Your SecretKey>'
await Qiniu.resource.qhash('<储存空间文件的URL>', 'md5');
```

### 文本文件合并

resource.concat(options);

[官方文档](https://developer.qiniu.com/dora/manual/1253/text-file-merging-concat)

options对象 有4个参数属性：
  - mimeType: string，必选，目标文件的MIME类型
  - urls: array, 必选，储存空间多个文件的url
  - saveas: object，可选，结果另存对象
  - pfop: object，可选，持久化处理对象

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 不需要设置'<Your AccessKey>', '<Your SecretKey>'
await Qiniu.resource.concat({
  mimeType: 'text/markdown',
  urls: [
    '****/README.md',
    '****/README2.md'
  ],
  // 结果另存为README.concat.md
  saveas: {
    bucketName: '<bucketName>',
    fileName: 'README.concat.md'
  },
  // 这里的bucketName是操作'****/README.md'的储存空间名称
  // 这里的fileName是操作'****/README.md'的文件名称，也就是README.md
  // 你可以理解为获取文件权限
  pfop: qiniu.pfop({
    bucketName: '<bucketName>',
    fileName: 'README.md'
  })
});
```

### 多文件压缩

resource.mkzip(options);

[官方文档](https://developer.qiniu.com/dora/manual/1667/mkzip)

options对象 有4个参数属性：
  - mode: number，可选，值为 2，用于少量文件压缩，mkzipArgs字符串长度不能超过2048字节。默认值
  - urls: array, 必选，储存空间多个文件的url
  - encoding: string, 可选，指示压缩包内资源命名的编码，目前支持 gbk 和 utf-8，默认 utf-8。
  - saveas: object，可选，结果另存对象
  - pfop: object，可选，持久化处理对象

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

await Qiniu.resource.mkzip({
  mode: 2,
  urls: [
    common.domain + '/README.md',
    common.domain + '/README2.md'
  ],
  saveas: {
    bucketName: '<bucketName>',
    fileName: 'README.mkzip.zip'
  },
  // 这里的bucketName是操作'****/README.md'的储存空间名称
  // 这里的fileName是操作'****/README.md'的文件名称，也就是README.md
  // 你可以理解为获取文件权限
  pfop: qiniu.pfop({
    bucketName: '<bucketName>',
    fileName: 'README.md'
  })
});
```

### MD转HTML

resource.md2html(url, options);

[官方文档](https://developer.qiniu.com/dora/manual/1285/md-html-md2html)

有两个参数：
  - url: string，必选，储存空间markdown文件的url
  - options: object，可选
    - mode: number，默认值为 0，0: 表示转为完整的 HTML (head + body) 输出，1: 表示只转为 HTML Body
    - cssUrl: string，CSS 样式的 URL

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

await Qiniu.resource.md2html('<markdown文件的url>', {
  mode: 1,
  cssUrl: '<css文件的url>'
});
```

### 资源下载二维码

resource.qrcode(url, options);

[官方文档](https://developer.qiniu.com/dora/manual/1298/resource-download-the-qr-code-qrcode)

有两个参数：
  - url: string，必选，储存空间文件的url
  - options: object，可选
    - mode: number，默认值为 0，0，为 DownloadURL 本身生成二维码，显示DownloadURL和DownloadURL指向的资源内容。1，为 DownloadURL 指向的资源内容生成二维码，只显示资源内容，不显示DownloadURL。
    - level: string，冗余度，可选值L（7%）、M（15%）、Q（25%），H（30%），默认为L。L是最低级别的冗余度，H最高。提高冗余度，较大可能会使生成图片总像素变多。
    - 图像处理操作请查看[processing处理参数详情](./image.md#图片处理)

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 生成资源二维码，并进行操作
await Qiniu.resource.qrcode('<储存空间文件的url>', {
  // 指定参数
  mode: 1,
  level: 'H',

  // 图像处理操作
  imageslim: true,  // 图像瘦身
  imageView: { w: 200, h: 300 },  // 图像缩放
  imageMogr: { blur: '20x2', rotate: 45 },  // 图像旋转
  watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },  // 图像水印
  roundPic: { radius: 20 },  // 图像圆角

  // 下载到本地
  path: __dirname + '/resource/qrcode.test.png'
});

// 生成资源二维码，并进行操作
await Qiniu.resource.qrcode('<储存空间文件的url>', {
  // 指定参数
  mode: 1,
  level: 'H',

  // 图像处理操作
  imageslim: true,  // 图像瘦身
  imageView: { w: 200, h: 300 },  // 图像缩放
  imageMogr: { blur: '20x2', rotate: 45 },  // 图像旋转
  watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },  // 图像水印
  roundPic: { radius: 20 },  // 图像圆角

  // 保存到指定的空间
  saveas: qiniu.saveas('<bucketName>', 'qrcode.processing.jpg')
});
```