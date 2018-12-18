## av 音视频操作

- [av.review 视频三鉴](#视频三鉴)
- [av.jobs 获取单个视频的识别结果或者获取处理任务列表](#获取单个视频的识别结果或者获取处理任务列表)
- [av.avsmart 锐智转码](#锐智转码)
- [av.avthumb 普通音视频转码](#普通音视频转码)
- [av.segment 音视频分段](#音视频分段)
- [av.hls 音视频切片（HLS）](#音视频切片（HLS）)
- [av.watermark 视频水印](#视频水印)
- [av.concat 音视频拼接](#音视频拼接)
- [av.avinfo 音视频元信息](#音视频元信息)
- [av.vframe 视频帧缩略图](#视频帧缩略图)
- [av.vsample 视频采样缩略图](#视频采样缩略图)
- [av.avvod 实时音视频转码](#实时音视频转码)
- [av.adapt 多码率自适应转码](#多码率自适应转码)
- [av.pm3u8 私有M3U8](#私有M3U8)

### 视频三鉴

av.review(options);

[官方文档](https://developer.qiniu.com/dora/manual/4258/video-pulp)

参数过多，请参照官网例子

options对象 有4个参数属性：
  - sdk: object, 必选，本模块的实例
  - vid: object, 必选，调用者设置的视频唯一标识，异步处理的返回结果中会带上该信息
  - body: object, 必选，请求参数，参数细节请看官网API
    - data: object, 必选
      - uri: string, 必选, 视频地址
    - params: object, 可选
      - async: boolean, 可选, true是异步处理，false是同步处理，不填则取默认值false
      - vframe: object, 可选
        - mode: number, 可选, 截帧逻辑，可选值为[0, 1]。0表示每隔固定时间截一帧，固定时间在vframe.interval中设定；1表示截关键帧。不填表示取默认值1。
        - interval: number,	可选, 当params.vframe.mode取0时，用来设置每隔多长时间截一帧，单位s, 不填则取默认值5s
      - save: string, 可选
        - bucket, 可选，保存截帧图片的Bucket名称
        - prefix: string, 可选，截帧图片名称的前缀，图片名称的格式为<prefix>/<video_id>/<offset> （图片命名格式仅供参考，业务请不要依赖此命名格式）
      - hookURL: string, 可选, 视频检测结束后的回调地址
    - ops: array, 必选
      - op: string, 必选, 视频检测执行的命令，支持多种视频检测操作。目前，视频鉴黄的命令就是pulp。
      - params: object, 可选
        - labels: array, 可选, 
          - label: string, 可选, 对某个命令返回label进行过滤，必须与ops.op.params.labels.select、ops.op.params.labels.score一起使用。例如，视频鉴黄的命令pulp的label有0色情, 1性感, 2正常。如果设置为label=0和select=2,则返回结果中只返回label=0的片段。注：score 越高，说明属于这一个分类（label）的概率越高。比如色情、性感、正常的label，正常这个label对应的score最高，则说明图片最有可能是正常的。
          - select: number, 可选, 对ops.op.params.labels.label中设置的label,设置过滤条件，1表示忽略不选，2表示只选该类别。
          - score: number, 可选, 过滤返回label结果的置信度参数，当ops.op.params.labels.select=1时表示忽略不选小于该设置的结果，当select=2时表示只选大于等于该设置的结果

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

let vid = Date.now().toString();
await Qiniu.av.review({
  vid: vid,
  sdk: qiniu,
  body: {
    data: {
      uri: 'http://pimnrbs1q.bkt.clouddn.com/v0200f5b0000bfsda182sajfu4jn53ng.mp4'
    },
    params: {
      // 异步，只会返回任务id
      async: true
    },
    ops: [
      { op: 'pulp' },
      { op: 'terror' },
      { op: 'politician' }
    ]
  }
});
```

### 获取单个视频的识别结果或者获取处理任务列表

av.jobs(options);

[官方文档](https://developer.qiniu.com/dora/manual/4258/video-pulp)

options对象 有3个参数属性：
  - sdk: object, 必选，本模块的实例
  - job_id: string, 可选，指定job_id获取单个视频的识别结果，不指定任务返回所有任务状态
  - status: string, 可选，任务状态 WAITING/DOING/RESCHEDULED/FAILED/FINISHED,RESCHEDULED是指等待重试中

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

await Qiniu.av.jobs({
  sdk: qiniu,
  // 获取指定任务id的任务
  job_id: '<job_id>'
});

await Qiniu.av.jobs({
  sdk: qiniu,
  // 获取指定RESCHEDULED状态的任务
  status: 'RESCHEDULED'
});
```

### 锐智转码

av.avsmart(options);

[官方文档](https://developer.qiniu.com/dora/manual/5135/avsmart#3)

options对象 有5个参数属性：
  - pfop: object，必选，持久化处理对象
  - saveas: object，可选，结果另存对象
  - format: string, 可选，封装格式。当前仅支持 mp4。默认值 mp4
  - oau: number, 可选，是否对音频转码, 0为不做操作，1为转码。
  - ignoreError: number, 可选，忽略压缩视频体积时的错误，1为忽略，0为不忽略。如果没能压缩视频大小, 则忽略该错误并且返回原视频

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

await Qiniu.av.avsmart({
  pfop: qiniu.pfop({
    bucketName: '<bucketName>',
    fileName: '<fileName>'
  }),
  saveas: {
    bucketName: '<bucketName>',
    fileName: '<fileName>'
  }
});
```

### 普通音视频转码

av.avthumb(options);

[官方文档](https://developer.qiniu.com/dora/manual/1248/audio-and-video-transcoding-avthumb)

参数过多，请参照官网例子

options对象 有一堆参数属性：
  - pfop: object，必选，持久化处理对象
  - saveas: object，可选，结果另存对象
  - format: string, 必选，封装格式，具体细节请参考[支持转换的封装格式](https://developer.qiniu.com/dora/kb/1320/avthumb-parameters-formats-format-and-explanation)。
  - stream: string, 可选，从输入源中选择要保留的或者要去除的媒体流，假设输入源有 n 个流（编号从 0 开始，n > 2），则保留媒体流的合法参数有 0、(n-1)、0..2、0..0、0,1,2 等，去除媒体流的合法参数有 -0、-(n-1)、-0..(n-2)、-1..1、-1,2 等，其中形如 a..b 表示保留编号为 [a,b] 流，a,b,c 表示保留编号为 a、b 和 c 的流，-a..b 表示去除编号为 [a..b] 流，-a,b,c 表示去除编号为 a、b 或 c 的流。流的编号可以通过 [avinfo](https://developer.qiniu.com/dora/manual/1247/audio-and-video-metadata-information-avinfo) 来查看。
  - ab: string, 可选，音频码率，单位：比特每秒（bit/s），常用码率：64k，128k，192k，256k，320k等。在不改变音频编码格式时，若指定码率大于原音频码率，则使用原音频码率进行转码。
  - aq: string, 可选，音频质量，取值范围为0-9（mp3），10-500（aac），仅支持mp3和aac，值越小越高。不能与上述码率参数共用。
  - ar: string, 可选，音频采样频率，单位：赫兹（Hz），常用采样频率：8000，12050，22050，44100等。
  - r: string, 可选，视频帧率，每秒显示的帧数，单位：赫兹（Hz），常用帧率：24，25，30等，一般用默认值。当HighFrameRate=0 时取值范围为[1, 30]，超出范围取25；当 HighFrameRate=1 时取值范围为[1, 60]，当大于60时取60，当小于1时取25。
  - hr: string, 可选，视频高帧率，与FrameRate配合使用，默认为HighFrameRate=0，即常规帧率；HighFrameRate=1表示保留高帧率。
  - vb: string, 可选，视频码率，单位：比特每秒（bit/s），常用视频码率：128k，1.25m，5m等。在不改变视频编码格式时，若指定码率大于原视频码率，则使用原视频码率进行转码。
  - vcodec: string, 可选，视频编码格式，具体细节请参考[支持转换的视频编码格式](https://developer.qiniu.com/dora/kb/1385/avthumb-parameter-vcodec-format-and-explanation)。
  - acodec: string, 可选，音频编码格式，具体细节请参考[支持转换的音频编码格式](https://developer.qiniu.com/dora/kb/1432/avthumb-parameter-acodec-format-and-explanation)。
  - audioProfile: string, 可选，设置音频的profile等级，支持：aac_he。注：需配合 libfdk_aac 编码方案使用，如 avthumb/m4a/acodec/libfdk_aac/audioProfile/aac_he。
  - scodec: string, 可选，字幕编码方案，支持方案：mov_text。该参数仅用于修改带字幕视频的字幕编码。
  - ss: string, 可选，指定音视频截取的开始时间，单位：秒，支持精确到毫秒，例如3.345s。用于视频截取，从一段视频中截取一段视频。
  - t: string, 可选，指定视频截取的长度，单位：秒，支持精确到毫秒，例如1.500s。用于视频截取，从一段视频中截取一段视频。
  - s: string, 可选，指定视频分辨率，格式为<width>x<height>或者预定义值，width 取值范围 [20,3840]，height 取值范围 [20,2160]。
  - autoscale: string, 可选，配合参数/s/使用，指定为1时，把视频按原始比例缩放到/s/指定的矩形框内，0或者不指定会强制缩放到对应分辨率，可能造成视频变形。
  - aspect: string, 可选，该参数为视频在播放器中显示的宽高比，格式为<width>:<height>。例如：取值3:4表示视频在播放器中播放是宽:高=3:4（注：此处取值仅为体现演示效果）。
  - stripmeta: string, 可选，是否清除文件的metadata，1为清除，0为保留。
  - h264Crf: string, 可选，设置h264的crf值，整数，取值范围[18,28]，值越小，画质更清晰。注意：不可与vb共用
  - h264Profile: string, 可选，设置 h264 的 profile等级，支持 baseline、main、high。
  - h264Level: string, 可选，设置 h264 的 level 值，合法的值有 3.0、3.1、4.0、4.1、4.2。
  - rotate: string, 可选，指定顺时针旋转的度数，可取值为90、180、270、auto，默认为不旋转。
  - wmImage: string, 可选，水印图片的源路径，目前仅支持远程路径，需要经过urlsafe_base64_encode。水印具体介绍见视频水印。模块已经urlsafe_base64_encode处理了。
  - wmGravity: string, 可选，视频图片水印位置，存在/wmImage/时生效。
  - wmText: string, 可选，水印文本内容, 需要经过urlsafe_base64_encode。模块已经urlsafe_base64_encode处理了。
  - wmGravityText: string, 可选，文本位置（默认NorthEast）
  - wmFont: string, 可选，文本字体，需要经过urlsafe_base64_encode，默认为黑体,注意：中文水印必须指定中文字体。模块已经urlsafe_base64_encode处理了。
  - wmFontColor: string, 可选，水印文字颜色，需要经过urlsafe_base64_encode，RGB格式，可以是颜色名称（例如红色）或十六进制（例如#FF0000），参考RGB颜色编码表，默认为黑色。模块已经urlsafe_base64_encode处理了。
  - wmFontSize: string, 可选，水印文字大小，单位: 缇，等于1/20磅，默认值0（默认大小）
  - writeXing: string, 可选，转码成mp3时是否写入xing header，默认1写入，写入会导致 file，afinfo 等命令识别出错误的码率。好处是在需要音频时长、帧数的时候只需要获取header。
  - an: string, 可选，是否去除音频流，0为保留，1为去除。默认值为0。
  - vn: string, 可选，是否去除视频流，0为保留，1为去除。默认值为0。
  - subtitle: string, 可选，添加字幕，支持：srt 格式字幕（uft-8 编码和和 utf-8 BOM 编码）、带有字幕的 mkv 文件、embed（将原视频的字幕流嵌入目标视频）。基于 base64 编码。
  - sn: string, 可选，是否去除字幕，0为保留，1为去除。默认值为0。
  - gop: string, 可选，GOP参数，即视频流关键帧间的间隔帧数，取值[0,3000]的整数，默认为0表示采用指定视频编码格式的默认GOP值，例如libx264格式默认GOP值为250。

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

await Qiniu.av.avthumb({
  pfop: qiniu.pfop({
    bucketName: '<bucketName>',
    fileName: '<fileName>'
  }),
  saveas: {
    bucketName: '<bucketName>',
    fileName: '<fileName>'
  },
  format: 'mp4',
  vb: '1.25m'
});
```

### 音视频分段

av.segment(options);

[官方文档](https://developer.qiniu.com/dora/manual/4154/dora-segment)

options对象 有3个参数属性：
  - format: string, 必选, 指定分段文件的封装格式，不改变原音/视频的编码情况下可以改变封装格式，如 h264+aac 编码的 mp4文件可以分段为h264+aac 编码的 mkv 小文件。注：如果值设置成 m3u8，表示封装格式为 HLS 流媒体文件。
  - pattern: string, 必选, 自定义分段后每一小段音/视频流的文件名称。采用 URL安全的 Base64 编码，例如 qiniu-$(count) 经过编码后为 cWluaXUtJChjb3VudCk=，pattern/cWluaXUtJChjb3VudCk= 将生成 qiniu-000000、qiniu-0000001、……、qiniu-xxxxxx 这样的小段音/视频文件，其中 $(count)是必须存在的六位占位符数字串。
  - segtime: string, 可选, 自定义分段后每一小段音/视频流的播放时长。单位为秒，最小值为5，默认值为5。

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

await Qiniu.av.segment({
  pfop: qiniu.pfop({
    bucketName: '<bucketName>',
    fileName: '<fileName>'
  }),
  format: 'mp4',
  segtime: 5,
  pattern: 'test-$(count).mp4'
});
```

### 音视频切片（HLS）

av.hls(options);

[官方网站](https://developer.qiniu.com/dora/manual/1485/audio-and-video-slice)

参数过多，请参照官网例子

options对象 有一堆参数属性：
- noDomain: string, 必选, 取值 0 或 1，默认为 0，推荐取值为 1。表示切片索引中的切片列表，是否使用相对地址，设置为 0 则使用绝对地址，设置为 1 则使用相对地址。
- domain: string, 可选, 用户指定切片中ts文件的域名。注意：域名需要urlbase64编码，且不能带http；该参数不能和noDomain/1共同使用。
- segtime: string, 可选, 用于自定义每一小段音/视频流的播放时长，单位为秒，取值范围为5-120秒，默认值为10秒。
- ab: string, 可选, 静态码率 (CBR)，单位为比特每秒 (bit/s)，常用的码率有：64k,128k,192k,256k,320k等。
- aq: string, 可选, 动态码率 (VBR)，取值范围为0-9，值越小码率越高。不能与静态码率参数共用。
- ar: string, 可选, 音频采样频率，单位为赫兹 (Hz)，常用的采样频率有：8000,12050,22050,44100等。
- r: string, 可选, 视频帧率，每秒显示的帧数，单位为赫兹 (Hz)，常用的帧率有：24,25,30等，一般用默认值。
- vb: string, 可选, 视频比特率，单位为比特每秒 (bit/s)，常用的视频比特率有：128k,1.25m,5m等。
- vcodec: string, 可选, 视频编码方案，支持的方案有：libx264,libvpx,libtheora,libxvid等，默认为libx264。
- acodec: string, 可选, 音频编码方案，支持的方案有：libmp3lame,libfaac,libvorbis等。
- scodec: string, 可选, 字幕编码方案，支持的方案有：mov_text。该参数仅用于修改带字幕视频的字幕编码。
- subtitle: string, 可选, 添加字幕，支持：srt格式字幕 (uft-8编码和和utf-8 BOM编码)，带有字幕的mkv文件，embed (将原视频的字幕流嵌入目标视频)。基于base64编码。
- ss: string, 可选, 指定视频截取的开始时间，单位为秒，支持精确到毫秒，例如3.345s。用于视频截取，从一段视频中截取一段视频。
- t: string, 可选, 指定视频截取的长度，单位为秒，支持精确到毫秒，例如1.500s。用于视频截取，从一段视频中截取一段视频。
- s: string, 可选, 指定视频分辨率，格式为：<width>x<height>，或者预定义值。
- stripmeta: string, 可选, 是否清除文件的metadata，1为清除，0为保留。
- rotate: string, 可选, 指定顺时针旋转的度数，取值可为：90,180,270,auto，默认为不旋转。
- hlsKey: string, 可选, AES128加密视频的秘钥，必须是16个字节。
- hlsKeyType: string, 可选, 密钥传递给我们的方式，0或不填。1.x(1.0, 1.1, ...)：见下面详细解释。
- hlsKeyUrl: string, 可选, 密钥的访问url
- pattern: string, 可选, 为各音视频流ts文件自定义命名。因为一整段音视频流音视频切片后会生成一个M3U8播放列表和多个默认命名的音视频流ts文件。示例：avthumb/m3u8/noDomain/1/pattern/eGlhb3hpYW8kKGNvdW50KQ==，其中eGlhb3hpYW8kKGNvdW50KQ==是自定义ts文件名，如：qiniu$(count)的URL安全的Base64编码，其中$(count)是必须存在的六位占位符数字串，qiniu可以自己定义。最后得到类似：qiniu000000,qiniu000001,……,qiniu000006命名的ts文件。

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

await Qiniu.av.segment({
  pfop: qiniu.pfop({
    bucketName: common.bucketName,
    fileName: common.fileName,
  }),
  noDomain: '1',
  format: 'mp4',
  segtime: 5,
  pattern: 'test_hls-$(count).mp4'
});
```

### 视频水印

av.watermark(options);

[官方文档](https://developer.qiniu.com/dora/manual/1314/video-watermarking)

现在视频水印功能已经和转码avthumb功能合并，可以同时转码以及做水印。文档请参考[av.avthumb 普通音视频转码](#普通音视频转码)

### 音视频拼接

av.concat(options);

[官方文档](https://developer.qiniu.com/dora/manual/1246/audio-and-video-stitching-avconcat)

options对象 有4个参数属性：
  - mode: number, 可选, 值为2，已默认，表示使用filter方法。
  - format: number, 必选, 目标视频的格式，例如 flv、mp4 等。请参考[支持转换的视频格式](https://developer.qiniu.com/dora/kb/1320/avthumb-parameters-formats-format-and-explanation)
  - index: number, 可选, 用于设置源文件在拼接时的位置（表示位于第几个视频），默认值为1，表示源文件在拼接时作为第一个视频，最大值为拼接视频的文件数，如果设置的值超过最大值，则会报错。
  - urls: array, 必选，完整源文件URL，1. 除去作为数据处理对象的源文件以外，还可以指定最多20个源文件（即总计21个片段）。2. 所有源文件必须属于同一存储空间 3. 也可以把要拼接的第一个视频作为key传入，例如示例中的使用方法。
```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

await Qiniu.av.concat({
  pfop: qiniu.pfop({
    bucketName: '<bucketName>',
    fileName: '<fileName>'
  }),
  saveas: {
    bucketName: '<bucketName>',
    fileName: '<fileName>'
  },
  format: 'mp4',
  urls: [
    'http://pimnrbs1q.bkt.clouddn.com/av'
  ]
});
```

### 音视频元信息

av.avinfo(url);

[官方文档](https://developer.qiniu.com/dora/manual/1247/audio-and-video-metadata-information-avinfo)

只有一个参数：
  url: string, 必选, 音视频的地址url

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');

await Qiniu.av.avinfo('<URL>');
```

### 视频帧缩略图

av.vframe(options);

[官方文档](https://developer.qiniu.com/dora/manual/1313/video-frame-thumbnails-vframe)

options对象 有5个参数属性：
  - format: string, 必选, 输出的目标截图格式，支持jpg、png等。
  - offset: number, 必选, 指定截取视频的时刻，单位：秒，精确到毫秒。
  - w: number, 可选, 缩略图宽度，单位：像素（px），取值范围为1-3840。
  - h: number, 可选, 缩略图高度，单位：像素（px），取值范围为1-2160。
  - rotate: number, 可选, 指定顺时针旋转的度数，可取值为90、180、270、auto，默认为不旋转。

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

await Qiniu.av.vframe({
  pfop: qiniu.pfop({
    bucketName: '<bucketName>',
    fileName: '<fileName>'
  }),
  saveas: {
    bucketName: '<bucketName>',
    fileName: '<fileName>'
  },
  offset: 1,
  format: 'png',
  rotate: 180
});
```

### 视频采样缩略图

av.vsample(options);

[官方文档](https://developer.qiniu.com/dora/manual/1315/video-sampling-thumbnails-vsample)

options对象 有7个参数属性：
  - format: string, 必选, 输出的目标截图格式，支持jpg、png等。
  - ss: number, 必选, 指定截取视频的开始时刻，单位：秒。
  - t: number, 必选, 采样总时长，单位：秒。
  - pattern: string, 必选, 指定各张截图的资源名格式，支持如下魔法变量：$(count) ：六个占位符的数字串，不足位的填充前导零即%06d，如 000001。注意：需要对设定值做URL安全的Base64编码。
  - s: number, 可选, 缩略图分辨率，单位：像素（px），格式：<Width>x<Height>，宽度取值范围为1-1920，高度取值围为1-1080。默认为原始视频分辨率。
  - rotate: number, 可选, 指定顺时针旋转的度数，可取值为90、180、270、auto，默认为不旋转。
  - interval: number, 可选, 指定采样间隔，单元：秒。默认为5秒。

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

await Qiniu.av.vframe({
  pfop: qiniu.pfop({
    bucketName: '<bucketName>',
    fileName: '<fileName>'
  }),
  pattern: 'vframe-$(count).png',
  ss: 0,
  format: 'png',
  t: 10
});
```

### 实时音视频转码

av.avvod(options);

[官方文档](https://developer.qiniu.com/dora/manual/1249/real-time-audio-and-video-transcoding-avvod)

options对象 有10个参数属性：
  - format: string, 可选, 目前只支持输出m3u8流（HLS协议），默认为m3u8
  - ab: string, 可选, 静态码率（CBR），单位：比特每秒（bit/s），常用码率：64k，128k，192k，256k，320k等
  - aq: string, 可选, 动态码率（VBR），取值范围为0-500，mp3(0-9),aac(10-500)。不能与上述静态码率参数共用
  - ar: string, 可选, 音频采样频率，单位：赫兹（Hz），常用采样频率：8000，12000，22050，44100等
  - r: string, 可选, 视频帧率，每秒显示的帧数，单位：赫兹（Hz），常用帧率：24，25，30等，一般用默认值
  - vb: string, 可选, 视频比特率，单位：比特每秒 (bit/s)，常用视频码率有：128k、1.25m、5m等。若指定码率大于原视频码率，则使用原视频码率进行转码
  - vcodec: string, 可选, 视频编码方案，支持方案：libx264，libvpx，libtheora，libxvid等，默认采用libx264
  - acodec: string, 可选, 音频编码方案，支持方案：libmp3lame，libfaac等，默认采用libfaac
  - s: string, 可选, 指定视频分辨率，格式为\x\或者预定义值，width取值范围20-1920，height取值范围20-1080，奇数自动减一
  - autosave: string, 可选, 自动持久化存储，转码后所有文件存储在源视频同一bucket内，取值0（非持久化）或1（持久化存储），默认为0

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');
 
await Qiniu.av.avvod({
  ab: '64k',
  r: '24'
});
```

### 多码率自适应转码

av.adapt(options);

[官方文档](https://developer.qiniu.com/dora/manual/1245/multiple-rate-adaptive-transcoding-adapt)

options对象 有10个参数属性：
  - format: string, 可选, 目前只支持m3u8，后续考虑支持dash等，默认为m3u8
  - envBandWidth: string, 必选, 同码流切换的带宽标准，采用符号,分隔多个网络带宽，个数范围[2,5]，取值范围[50000,30000000]，单位是b/s。注：个数与存在的multi参数值个数需要保持一致，建议与设置的码率值接近，带宽值采用升序方式。
  - multiAb: string, 可选, 与ab参数不共存，单位：比特每秒（bit/s），采用符号,分隔多个音频码率，个数范围[2,5]，例如64k,128k,256k。注：码率个数与其他存在的multi参数值个数需要保持一致，魔法变量$(origin)表示原音频码率。
  - multiVb: string, 可选, 与vb参数不共存，单位：比特每秒（bit/s），采用符号,分隔多个视频码率，个数范围[2,5]，例如128k,600k,1.25m。注：码率个数与其他存在的multi参数值个数需要保持一致，魔法变量$(origin)表示原视频码率。
  - multiResolution: string, 可选, 与resolution参数不共存，分辨率格式为 w:h ，w取值范围[20,3840]，h取值范围[20,2160]，采用符号,分隔多个视频分辨率，个数范围[2,5]，例如320:240,640:480,1080:720。注：会改变DAR，分辨率个数与其他存在的multi参数值个数需要保持一致，魔法变量$(origin)表示原视频分辨率。
  - multiPrefix: string, 可选, 设置文件内的m3u8名称，同时该名称作为子m3u8的所有ts文件名的前缀。采用字符,分隔多个prefix，示例：/multiPrefix/cWluaXUtYQ==,cWluaXUtYg==，其中cWluaXUtYQ==是定义的第一个m3u8文件的前缀，是qiniu-a的URL安全的Base64编码，cWluaXUtYg==是定义的第二个m3u8文件的前缀，是qiniu-b的URL安全的Base64编码，每个子m3u8文件中的ts名称为前缀名称-$(count).ts，其中$(count)是六位占位符数字串，最后得到的结果中会有两个子m3u8，名称为qiniu-a.m3u8 (内部ts为qiniu-a_000000.ts,qiniu-a_000001.ts...)和 qiniu-b.m3u8(内部ts为qiniu-b_000000.ts,qiniu-b_000001.ts...)。
  - vb: string, 可选, 视频比特率，单位：比特每秒（bit/s），常用视频比特率：128k, 1.25m, 5m 等。
  - ab: string, 可选, 单位：比特每秒（bit/s），常用码率：320k, 256k, 192k, 128k, 64k 等。
  - resolution: string, 可选, 指定视频分辨率，格式为 w:h 或者预定义值，w取值范围[20,3840]，h取值范围[20,2160]。
  - hlstime: string, 可选, 用于 HLS 自定义每一小段音/视频流的播放时间长度，取值范围为: 10 - 60 （秒），默认值为 10（单位:秒）。

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');
 
await Qiniu.av.adapt({
  pfop: qiniu.pfop({
    bucketName: '<bucketName>',
    fileName: '<fileName>'
  }),
  envBandWidth: '200000,800000',
  multiPrefix: [
    'adapt_test-a', 'adapt_test-b'
  ]
});
```

### 私有M3U8

av.pm3u8(options);

[官方文档](https://developer.qiniu.com/dora/manual/1292/private-m3u8-pm3u8)

options对象 有7个参数属性：
  - qiniu: object, 必选, 本模块的实例
  - url: string, 必选, 文件的url
  - mode: number, 可选, 默认0，处理模式，只有一个值0。0表示对所有ts资源的url进行下载授权。
  - expires: number, 可选, 私有ts资源url下载凭证的相对有效期，单位秒。推荐43200秒（12小时）。
  - deadline: number, 可选, 私有ts资源url下载凭证的绝对有效期(Unix Time)，单位秒。此参数填写后，expires失效。
  - pipe: Stream的实例, 可选, 响应文件的流，pipe和path至少要有一个
  - path: string, 可选, 下载到本地的路径，pipe和path至少要有一个

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 下载到本地的__dirname + '/pm3u8.txt'
await Qiniu.av.pm3u8({
  url: common.domain + '/adapt_test-a.m3u8',
  qiniu: qiniu,
  path: __dirname + '/pm3u8.txt'
});
```