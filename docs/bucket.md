```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

async function run (){

  // 创建可管理的储存空间对象
  const bucket = qiniu.bucket('<存储空间名称>');

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
}

run();

```