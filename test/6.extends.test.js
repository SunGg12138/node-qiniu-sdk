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
  this.timeout(20000);
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
    .sliceUpload({ path: __dirname + '/resource/sliceUpload.test.zip' })
    .then(function(result){
      debug('sliceUp分片上传并返回：%s', JSON.stringify(result));
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