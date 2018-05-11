```javascript
// 引入模块
const SDK = require('node-qiniu-sdk');
// 配置你的qiniu_sdk
const qiniu_sdk = new SDK('<Your AccessKey>', '<Your SecretKey>');

async function run (){
  /**
   * 获取 Bucket 列表
   * 官方文档：https://developer.qiniu.com/kodo/api/3926/get-service
  */
  await qiniu_sdk.buckets();

  /**
   * 异步第三方资源抓取
   * 官方文档：https://developer.qiniu.com/kodo/api/4097/asynch-fetch
   * zone是七牛各区域机房代号，默认是z0(华东地区)
   * body就是官方文档中的Body参数
  */
  await qiniu_sdk.sisyphus({
      zone: 'z0',
      body: {
        url: 'http://p0vquqra2.bkt.clouddn.com/24993290_658467184540793_2921387702181767499_n.jpg;http://p0vquqra2.bkt.clouddn.com/test.jpg',
        bucket: 'target'
      }
  });

  /**
   * 批量操作 测试未通过
   * 官方文档：https://developer.qiniu.com/kodo/api/1250/batch
   * 参数ops是操作指令的集合，必须是长度大于0的数组
   * 操作指令：
   *   _type：标记操作类型
   *   bucket：储存空间名称
   *   fileName：操作文件的名字
   *   其它的参数和正常文件操作的参数一致
   */
  await qiniu_sdk.batch({
    ops: [
      {
        _type: 'move',
        bucket: 'study',
        fileName: 'test.png',
        dest: 'test-1.png',
        force: false
      },
      {
        _type: 'copy',
        bucket: 'study',
        fileName: 'test2.png',
        dest: 'test-2.png',
        force: false
      },
      {
        _type: 'chtype',
        bucket: 'study',
        fileName: 'test3.png',
        type: 1
      },
      {
        _type: 'stat',
        bucket: 'study',
        fileName: 'test12138.png',
      },
      {
        _type: 'delete',
        bucket: 'study',
        fileName: 'games.data.js',
      }
    ]
  });
}

run();

```