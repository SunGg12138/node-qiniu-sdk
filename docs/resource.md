## resource 资源操作

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 所有的方法都返回promise，这里我就直接用await了

// URL需要是完整的
// 资源操作部分API不需要token，直接使用就可以

// 文件HASH值
// 官方文档：https://developer.qiniu.com/dora/manual/1297/file-hash-value-qhash
await Qiniu.resource.qhash('<URL>', '<algorithm>');

// MD转HTML
// 官方文档：https://developer.qiniu.com/dora/manual/1285/md-html-md2html
await Qiniu.resource.md2html('<URL>');

// 资源下载二维码
// 官方文档：https://developer.qiniu.com/dora/manual/1298/resource-download-the-qr-code-qrcode
await Qiniu.resource.qrcode('<URL>');

// 资源下载二维码
// 官方文档：https://developer.qiniu.com/dora/manual/1298/resource-download-the-qr-code-qrcode

// 处理后的二维码保存到本地
await Qiniu.resource.qrcode(common.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 },
      path: __dirname + '/resource/qrcode.test.png'
    });
// 处理后的二维码保存到储存空间
await Qiniu.resource.qrcode(common.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 },
      saveas: qiniu.saveas(common.bucketName, 'qrcode.processing.jpg')
    });

// 文本文件合并
// 官方文档：https://developer.qiniu.com/dora/manual/1253/text-file-merging-concat
await Qiniu.resource.concat({
      // 合并资源的mimeType类型
      mimeType: 'text/markdown',
      // 要合并的资源的URL
      urls: [
        common.domain + '/README.md',
        common.domain + '/README2.md'
      ],
      // 保存后的别名，如果不设置此参数，名字是它的hash值
      saveas: {
        bucketName: common.bucketName,
        fileName: 'README.concat.md'
      },
      // 需要持久化储存支持
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: 'README.md'
      })
    });

// 多文件压缩
// 官方文档：https://developer.qiniu.com/dora/manual/1667/mkzip
await Qiniu.resource.mkzip({
      // 2（少量文件压缩）或4（大量文件压缩），
      mode: 2,
      // 压缩文件的url
      urls: [
        common.domain + '/README.md',

        // 也可以设置一个对象，alias表示别名
        {
          url: common.domain + '/README2.md',
          alias: 'alias.md'
        }
      ],
      // 保存后的别名，如果不设置此参数，名字是它的hash值
      saveas: {
        bucketName: common.bucketName,
        fileName: 'README.mkzip.zip'
      },
      // 需要持久化储存支持
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: 'README.md'
      })
    });
```