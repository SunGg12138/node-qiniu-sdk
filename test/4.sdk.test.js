const expect = require('chai').expect;
const debug = require('debug')('test');
const Qiniu = require('../index');
const qiniu_config = require('./resource/qiniu.config');
const qiniu = new Qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

const common = {
  bucketName: null
};
describe('SDK 相关方法测试', function(){
  this.timeout(20000);
  before(function(done){
    // 随机个名字
    common.bucketName = new Date().getTime() + '';
    qiniu.bucket(common.bucketName)
    .mk()
    .then(function(result){
      debug('创建bucket：%s并返回：%s', common.bucketName, JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('buckets 获取 Bucket 列表', function(done){
    qiniu.buckets()
    .then(function(result){
      debug('获取 Bucket 列表并返回：%s', JSON.stringify(result));
      expect(result).to.be.an('array');
      done();
    })
    .catch(console.error);
  });
  it('sisyphus 异步第三方资源抓取', function(done){
    qiniu.sisyphus({
      body: {
        url: [
          'https://www.baidu.com/img/bd_logo1.png?qua=high',
          'https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=3436665273,1985018126&fm=58&w=200&h=200&img.JPEG'
        ],
        bucket: common.bucketName
      }
    })
    .then(function(result){
      debug('异步第三方资源抓取并返回：%s', JSON.stringify(result));
      expect(result).to.be.an('object');
      done();
    })
    .catch(console.error);
  });
  after(function(done){
    qiniu.bucket(common.bucketName)
    .drop()
    .then(function(result){
      debug('删除Bucket并返回：%s', JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
});
// sdk.batch({
//   ops: [
//     {
//       _type: 'move',
//       bucket: 'study',
//       fileName: 'test.png',
//       dest: 'test-1.png',
//       force: false
//     },
//     {
//       _type: 'copy',
//       bucket: 'study',
//       fileName: 'test2.png',
//       dest: 'test-2.png',
//       force: false
//     },
//     {
//       _type: 'chtype',
//       bucket: 'study',
//       fileName: 'test3.png',
//       type: 1
//     },
//     {
//       _type: 'stat',
//       bucket: 'study',
//       fileName: 'test12138.png',
//     },
//     {
//       _type: 'delete',
//       bucket: 'study',
//       fileName: 'games.data.js',
//     }
//   ]
// })
// .then(console.log, console.log);