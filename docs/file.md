```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

async function run (){
  // 创建可管理的文件对象
  // 存储空间名称与文件名称中间用 ":" 分隔
  const file = qiniu.file('<存储空间名称>:<文件名称>');

  // 直传文件
  // 参数还有很多，只有path参数是必须
  // 官方文档：https://developer.qiniu.com/kodo/api/1312/upload
  await file.upload({ path: '<本地文件路径>' });

  // 资源移动／重命名
  // 官方文档：https://developer.qiniu.com/kodo/api/1288/move
  // isForce表示是否强制重命名，这个区别是在新名字是否已存在时
  await file.move('<新名字>', '<isForce>');

  // 资源复制
  // 官方文档：https://developer.qiniu.com/kodo/api/1254/copy
  // isForce表示是否强制复制，这个区别是在新文件的名字是否已存在时
  await file.copy('<新名字>', '<isForce>');

  // 修改文件状态，0表示启用；1表示禁用
  // 官方文档：https://developer.qiniu.com/kodo/api/4173/modify-the-file-status
  await file.chstatus(1);

  // 更新文件生命周期，在deleteAfterDays天会被删除，0表示取消生命周期  没有报错，但是控制台无生命周期
  // 官方文档：https://developer.qiniu.com/kodo/api/1732/update-file-lifecycle
  await file.deleteAfterDays(7);

  // 修改文件存储类型，0 表示标准存储；1 表示低频存储
  // 官方文档：https://developer.qiniu.com/kodo/api/3710/chtype
  await file.chtype(1);

  // 资源元信息查询
  // 官方文档：https://developer.qiniu.com/kodo/api/1308/stat
  await file.stat();

  // 资源元信息修改，未通过测试用例
  // 官方文档：https://developer.qiniu.com/kodo/api/1252/chgm
  await file.chgm();
  
  // 第三方资源抓取
  // 官方文档：https://developer.qiniu.com/kodo/api/1263/fetch
  await file.fetch('https://www.baidu.com/img/bd_logo1.png?qua=high');

  // 镜像资源更新
  // 官方文档：https://developer.qiniu.com/kodo/api/1293/prefetch
  await file.prefetch();

  // 删除接口
  // 官方文档：https://developer.qiniu.com/kodo/api/1257/delete
  await file.delete();
}

run();
```