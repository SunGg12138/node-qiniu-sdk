## image 图像操作

- [image.imageInfo 图片基本信息](#图片基本信息)
- [image.exif 图片EXIF信息](#图片EXIF信息)
- [image.imageAve 图片平均色调](#图片平均色调)
- [image.pulp 图片鉴黄](#图片鉴黄)
- [image.terror 图片鉴暴恐](#图片鉴暴恐)
- [image.politician 政治人物识别](#政治人物识别)
- [image.review 图片审核](#图片审核)
- [image.faceDetect 人脸检测](#人脸检测)
- [image.faceSim 1:1人脸比对](#人脸比对1:1)
- [image.faceGroup 1:N人脸比对](#人脸比对1:N)
- [image.imageGroup 以图搜图](#以图搜图)
- [image.ocr OCR身份证识别](#OCR身份证识别)
- [image.processing 图片处理](#图片处理)

### 图片基本信息

image.imageInfo(url);

[官方文档](https://developer.qiniu.com/dora/manual/1269/pictures-basic-information-imageinfo)

有一个参数：
  - url: string，必选，图片的url

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 不需要设置'<Your AccessKey>', '<Your SecretKey>'
await Qiniu.image.imageInfo('<URL>');
```

### 图片EXIF信息

image.exif(url);

[官方文档](https://developer.qiniu.com/dora/manual/1260/photo-exif-information-exif)

有一个参数：
  - url: string，必选，图片的url

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 不需要设置'<Your AccessKey>', '<Your SecretKey>'
await Qiniu.image.exif('<URL>');
```

### 图片平均色调

image.imageAve(url);

[官方文档](https://developer.qiniu.com/dora/manual/1268/image-average-hue-imageave)

有一个参数：
  - url: string，必选，图片的url

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 不需要设置'<Your AccessKey>', '<Your SecretKey>'
await Qiniu.image.imageAve('<URL>');
```

### 图片鉴黄

image.pulp(url);

[官方文档](https://developer.qiniu.com/dora/manual/3701/ai-pulp)

有一个参数：
  - url: string，必选，图片的url

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 不需要设置'<Your AccessKey>', '<Your SecretKey>'
await Qiniu.image.pulp('<URL>');
```

### 图片鉴暴恐

image.terror(url);

[官方文档](https://developer.qiniu.com/dora/manual/3918/terror)

有一个参数：
  - url: string，必选，图片的url

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 不需要设置'<Your AccessKey>', '<Your SecretKey>'
await Qiniu.image.terror('<URL>');
```

### 政治人物识别

image.politician(url);

[官方文档](https://developer.qiniu.com/dora/manual/3922/politician)

有一个参数：
  - url: string，必选，图片的url

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 不需要设置'<Your AccessKey>', '<Your SecretKey>'
await Qiniu.image.politician('<URL>');
```

### 图片审核

image.review(options);

[官方文档](https://developer.qiniu.com/dora/manual/4252/image-review)

options对象 有4个参数属性：
  - sdk: object，必选，本模块的实例
  - uri: string，必选，
    图片资源。支持两种资源表达方式：
      1. 网络图片URL地址；
      2. 图片 base64 编码字符串，需在编码字符串前加上前缀 data:application/octet-stream;base64, 例：data:application/octet-stream;base64,xxx
  - type: array，可选，选择的审核类型，可选项：pulp/terror/politician。默认选择全部 pulp/terror/politician
  - detail: bool，仅当 params.type 是terror时有效，用于判断是否返回暴恐的详细分类结果。true表示返回详细分类结果，false表示不返回详细分类结果。默认是false

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

await Qiniu.image.review({
  uri: '<储存空间的图片的URL>',
  type: [ 'pulp', 'terror', 'politician' ],
  detail: true,
  sdk: qiniu
});
```

### 人脸检测

image.faceDetect(options);

[官方文档](https://developer.qiniu.com/dora/manual/4281/face-detection)

options对象 有4个参数属性：
  - sdk: object，必选，本模块的实例
  - uri: string, 必选，图片的url

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 进行人脸检测请求
await Qiniu.image.faceDetect({
  uri: 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg',
  sdk: qiniu
});
```

### 1:1人脸比对

image.faceSim(options);

[官方文档](https://developer.qiniu.com/dora/manual/4282/face-sim)

options对象 有4个参数属性：
  - sdk: object，必选，本模块的实例
  - uris: string, 必选，对比的两张图片的url

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 进行1:1人脸比对请求
await Qiniu.image.faceSim({
  uris: [
    { uri: 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg' },
    { uri: 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg' }
  ],
  sdk: qiniu
});
```

### 1:N人脸比对

image.faceGroup(options);

[官方文档](https://developer.qiniu.com/dora/manual/4438/face-recognition)

options对象 有4个参数属性：
  - sdk: object，必选，本模块的实例
  - op: string, 必选，1:N人脸比对操作符
  - data: object, 必选，操作符操作的参数

操作符        | 说明
-------------|----------------
newGroup     | 新建人像库
addFace      | 添加人脸
deleteFace   | 删除人脸
groupList    | 显示所有人像库
groupInfo    | 显示指定人像库信息
faceList     | 显示所有人脸
faceInfo     | 显示指定人脸信息
search       | 人脸搜索
_search      | 人脸搜索（旧版本）
removeGroup  | 删除人像库

操作详情请查阅 [6.image.test.js](../test/6.image.test.js) 103行~270行

### 以图搜图

image.imageGroup(options);

[官方文档](https://developer.qiniu.com/dora/manual/4680/image-search)

options对象 有4个参数属性：
  - sdk: object，必选，本模块的实例
  - op: string, 必选，1:N人脸比对操作符
  - data: object, 必选，操作符操作的参数

操作符        | 说明
-------------|----------------
newGroup     | 新建图像库
addImage     | 添加图片
deleteImage  | 删除图片
groupList    | 显示所有图像库
groupInfo    | 显示指定图像库信息
imageList    | 显示所有图片
imageInfo    | 显示指定图片信息
search       | 图片搜索
_search      | 图片搜索（旧版本）
removeGroup  | 删除图像库

操作详情请查阅 [6.image.test.js](../test/6.image.test.js) 272行~433行

### OCR身份证识别

image.ocr(options);

[官方文档](https://developer.qiniu.com/dora/manual/4276/ocr-sari-idcard)

options对象 有4个参数属性：
  - sdk: object，必选，本模块的实例
  - uri: string, 必选，对比的两张图片的url

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 进行ocr身份证识别
await Qiniu.image.ocr({
  uri: 'http://pimnrbs1q.bkt.clouddn.com/ocr2.jpg',
  sdk: qiniu
});
```

### 图片处理

[官方文档](https://developer.qiniu.com/dora/manual/3683/img-directions-for-use)

操作详情请查阅 [6.image.test.js](../test/6.image.test.js) 445行~479行

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