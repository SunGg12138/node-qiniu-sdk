## pandora 智能日志管理平台

- [pandora.send 数据推送](#数据推送)

### 数据推送

pandora.send(options);

[官方文档](https://developer.qiniu.com/insight/api/4749/data-push-api)

options对象 有2个参数属性：
  - repoName, string, 必选, 消息队列名称
  - content, array, 必选，数据内容

```javascript

// 引入模块
const Qiniu = require('node-qiniu-sdk');

// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

const pandora = qiniu.pandora();

await pandora.send({
  repoName: Date.now() + '',
  content: [
    { userName: '小张', age: 12, addresses: "beijing"},
    { userName: '小王', age: 13, addresses: "hangzhou"}
  ]
});
```