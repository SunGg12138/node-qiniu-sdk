## image 图像操作

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 所有的方法都返回promise，这里我就直接用await了

// 创建可管理的image对象
// 图像的操作前必须要配置图像的URL
// URL需要是完整的
// 图像操作部分API不需要token，不用配置你的AccessKey和SecretKey，直接使用就可以

// 获取图片基本信息
// 官方文档：https://developer.qiniu.com/dora/manual/1269/pictures-basic-information-imageinfo
await Qiniu.image.imageInfo('<URL>');

// 图片EXIF信息
// 官方文档：https://developer.qiniu.com/dora/manual/1260/photo-exif-information-exif
await Qiniu.image.exif('<URL>');

// 图片平均色调信息
// 官方文档：https://developer.qiniu.com/dora/manual/1268/image-average-hue-imageave
await Qiniu.image.imageAve('<URL>');

// 图片鉴黄
// 官方文档：https://developer.qiniu.com/dora/manual/3701/ai-pulp
await Qiniu.image.pulp('<URL>');

// 图片鉴暴恐
// 官方文档：https://developer.qiniu.com/dora/manual/3918/terror
await Qiniu.image.terror('<URL>');

// 政治人物识别
// 官方文档：https://developer.qiniu.com/dora/manual/3922/politician
await Qiniu.image.politician('<URL>');

// 图片审核
// 官方文档：https://developer.qiniu.com/dora/manual/4252/image-review
await Qiniu.image.review({
  uri: '<URL>',
  sdk: qiniu
});

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

// 你也可以使用saveas(处理结果另存)来直接保存在储存空间里
await Qiniu.image.processing('<URL>', {
  imageslim: true,
  imageView: { w: 200, h: 300 },
  imageMogr: { blur: '20x2', rotate: 45 },
  watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
  roundPic: { radius: 20 },
  saveas: qiniu.saveas('bucket:key.jpg')
});
```

### processing参数介绍

```javascript
/**
 * imageslim {Boolean} 表示是否进行图片瘦身，
 * imageView {Object} 基本处理，具体参数如下
 *    w：宽度
 *    h：高度
 *    format：格式化图片输出，取值范围psd、jpeg、png、gif、webp、tiff、bmp，默认为原图格式
 *    interlace：是否支持渐进显示。取值1支持渐进显示，取值0不支持渐进显示（默认为0）。适用jpg目标格式，网速慢时，图片显示由模糊到清晰
 *    q：新图的图片质量，取值范围是[1, 100]，默认75。
 *    ignore-error：取值1，设置了此参数时，若图像处理的结果失败，则返回原图。
 * imageMogr {Object} 高级处理，具体参数如下
 *    auto-orient：本模块自动设置此值，不需要用户设置
 *    thumbnail：参看缩放操作参数表，缩放操作参数表：https://developer.qiniu.com/dora/manual/1270/the-advanced-treatment-of-images-imagemogr2#imagemogr2-thumbnail-spec
 *    strip：{Boolean} 去除图片中的元信息。去除的信息有：bKGD、cHRM、EXIF、gAMA、iCCP、iTXt、sRGB、tEXt、zCCP、zTXt、date
 *    gravity：参看图片处理重心参数表，https://developer.qiniu.com/dora/manual/1270/the-advanced-treatment-of-images-imagemogr2#imagemogr2-anchor-spec
 *    crop：参看裁剪操作参数表。https://developer.qiniu.com/dora/manual/1270/the-advanced-treatment-of-images-imagemogr2#imagemogr2-crop-size-spec
 *    rotate：旋转角度，取值范围为1-360，默认为不旋转
 *    format：图片格式。支持jpg、gif、png、webp等，默认为原图格式，参看支持转换的图片格式。http://www.imagemagick.org/script/formats.php
 *    blur：高斯模糊参数。radius是模糊半径，取值范围为1-50。sigma是正态分布的标准差，必须大于0。图片格式为gif时，不支持该参数。
 *    interlace：是否支持渐进显示。取值1支持渐进显示，取值0不支持渐进显示（默认为0）。适用jpg目标格式，网速慢时，图片显示由模糊到清晰
 *    quality：新图的图片质量。取值范围为1-100，默认75。
 *    sharpen：图片是否锐化，当设置值为1时打开锐化效果。
 *    size-limit：限制图片转换后的大小，支持以兆字节和千字节为单位的图片。
 * watermark {Object} 水印处理，具体参数如下
 *    image：指定水印图片的url,
 *    dissolve：透明度，取值范围1-100，默认值为100（完全不透明）。
 *    gravity：水印位置，参考水印锚点参数表，默认值为SouthEast（右下角）。https://developer.qiniu.com/dora/manual/1316/image-watermarking-processing-watermark#watermark-anchor-spec
 *    dx：横轴边距，单位:像素(px)，默认值为10。
 *    dy：纵轴边距，单位:像素(px)，默认值为10。
 *    ws：水印图片自适应原图的短边比例，ws的取值范围为0-1。具体是指水印图片保持原比例，并短边缩放到原图短边＊ws。
 *    wst：水印图片自适应原图的类型，取值0、1、2、3分别表示为自适应原图的短边、长边、宽、高，默认值为0
 * roundPic {Object} 图片圆角处理
 *    radius：圆角大小的参数，水平和垂直的值相同，可以使用像素数（如200）或百分比（如!25p）。不能与radiusx和radiusy同时使用。
 *    radiusx：圆角水平大小的参数，可以使用像素数（如200）或百分比（如!25p）。需要与radiusy同时使用。
 *    radiusy：圆角垂直大小的参数，可以使用像素数（如200）或百分比（如!25p）。需要与radiusx同时使用。
*/
```