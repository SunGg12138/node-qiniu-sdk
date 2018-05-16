try {
  const qiniu_config = require('./resource/qiniu.config');
} catch (error) {
  throw new Error(`
  先配置你的/test/resource/qiniu.config.json文件再测试
  qiniu.config.json是放置AccessKey和SecretKey的配置文件
  格式与qiniu.config.default.json相同，你需要配置你的qiniu.config.json
  `);
}

const expect = require('chai').expect;
const debug = require('debug')('test');
const Qiniu = require('../index');
const qiniu_config = require('./resource/qiniu.config');
const qiniu = new Qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

const common = {
  bucketName: null,
  fileName: 'sliceUpload.test.zip',
  scope: null
};

describe('自定义扩展方法测试', function(){
  this.timeout(30000);
  before(function(done){
    // 随机个名字
    common.bucketName = new Date().getTime() + '';
    common.scope = common.bucketName + ':' + common.fileName;

    qiniu.bucket(common.bucketName)
    .mk()
    .then(function(result){
      debug('创建bucket：%s并返回：%s', common.bucketName, JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('sliceUpload分片上传', function(done){
    qiniu.file(common.scope)
    .sliceUpload(__dirname + '/resource/sliceUpload.test.zip')
    .then(function(result){
      debug('sliceUp分片上传并返回：%s', JSON.stringify(result));
      expect(result).to.be.an('object');
      expect(result.hash).to.be.a('string');
      expect(result.key).to.be.a('string');
      done();
    })
    .catch(console.error);
  });
  it('concurrentSliceUpload并发分片上传', function(done){
    qiniu.file(common.scope)
    .concurrentSliceUpload({ path: __dirname + '/resource/sliceUpload.test.zip', max: 2 })
    .then(function(result){
      debug('concurrentSliceUpload并发分片上传并返回：%s', JSON.stringify(result));
      expect(result).to.be.an('object');
      expect(result.hash).to.be.a('string');
      expect(result.key).to.be.a('string');
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