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

[官方文档](https://developer.qiniu.com/dora/manual/4258/video-pulp)

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