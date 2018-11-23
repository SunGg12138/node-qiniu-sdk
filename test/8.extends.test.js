try {
  require('./resource/qiniu.config');
} catch (error) {
  throw new Error(`
  先配置你的/test/resource/qiniu.config.json文件再测试
  qiniu.config.json是放置AccessKey和SecretKey的配置文件
  1. 配置你的AccessKey和SecretKey到/test/resource/qiniu.config.default.json 
  2. qiniu.config.default.json 改名为qiniu.config.json
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
  before(async function(){
    // 随机个名字
    common.bucketName = new Date().getTime() + '';
    common.scope = common.bucketName + ':' + common.fileName;

    let result = await qiniu.bucket(common.bucketName).mk();
    debug('创建bucket：%s并返回：%s', common.bucketName, JSON.stringify(result));
  });
  it('sliceUpload并发分片上传', async function(){
    let result = await qiniu.file(common.scope).sliceUpload({ path: __dirname + '/resource/sliceUpload.test.zip', max: 2 });
    debug('sliceUpload并发分片上传并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.hash).to.be.a('string');
    expect(result.key).to.be.a('string');
  });
  after(async function(){
    let result = await qiniu.bucket(common.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
});