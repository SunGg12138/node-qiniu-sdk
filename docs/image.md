## 图像操作使用预览

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 所有的方法都返回promise，这里我就直接用await了

// 创建可管理的image对象
// 图像的操作前必须要配置图像的URL
// URL需要是完整的
// 图像操作不需要token，直接使用就可以

// 获取图片基本信息
// 官方文档：https://developer.qiniu.com/dora/manual/1269/pictures-basic-information-imageinfo
await Qiniu.image.imageInfo('<URL>');

// 图片EXIF信息
// 官方文档：https://developer.qiniu.com/dora/manual/1260/photo-exif-information-exif
await Qiniu.image.exif('<URL>');

// 图片平均色调
// 官方文档：https://developer.qiniu.com/dora/manual/1268/image-average-hue-imageave
await Qiniu.image.imageAve('<URL>');

// 图像处理
// mageView 官方文档：https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2
// imageMogr 官方文档：https://developer.qiniu.com/dora/manual/1270/the-advanced-treatment-of-images-imagemogr2
// watermark 官方文档：https://developer.qiniu.com/dora/manual/1316/image-watermarking-processing-watermark
// roundPic 官方文档：https://developer.qiniu.com/dora/manual/4083/image-rounded-corner
//
// 如果指定path或stream会进行流操作写成图片，否则只会输出请求的url
await Qiniu.image.processing('<URL>', {
  imageslim: true,
  imageView: { w: 200, h: 300 },
  imageMogr: { blur: '20x2', rotate: 45 },
  watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
  roundPic: { radius: 20 },
  path: __dirname + '/resource/processing.test.jpg'
});
```