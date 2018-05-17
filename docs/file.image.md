## 图像操作使用预览

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 所有的方法都返回promise，这里我就直接用await了

// 创建可管理的文件对象
// 图像的操作前必须要配置域名
// 域名需要带上协议http或https
const file = qiniu.file('<存储空间名称>:<文件名称>').domain('<域名>');

// 获取图片基本信息
// 官方文档：https://developer.qiniu.com/dora/manual/1269/pictures-basic-information-imageinfo
await file.imageInfo();

// 图片EXIF信息
// 官方文档：https://developer.qiniu.com/dora/manual/1260/photo-exif-information-exif
await file.exif();

// 图片平均色调
// 官方文档：https://developer.qiniu.com/dora/manual/1268/image-average-hue-imageave
await file.imageAve();

// 图像处理
// mageView 官方文档：https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2
// imageMogr 官方文档：https://developer.qiniu.com/dora/manual/1270/the-advanced-treatment-of-images-imagemogr2
// watermark 官方文档：https://developer.qiniu.com/dora/manual/1316/image-watermarking-processing-watermark
// roundPic 官方文档：https://developer.qiniu.com/dora/manual/4083/image-rounded-corner
//
// 如果指定path或stream会进行流操作写成图片，否则只会输出请求的url
await file.processing({
  imageslim: true,
  imageView: { w: 200, h: 300 },
  imageMogr: { blur: '20x2', rotate: 45 },
  watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
  roundPic: { radius: 20 },
  path: __dirname + '/resource/processing.test.jpg'
});
```