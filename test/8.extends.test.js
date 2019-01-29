const common = require('./common');
// 检查是否已经配置好了qiniu.config文件
common.beforeTest();

const expect = require('chai').expect;
const debug = require('debug')('test');
const Qiniu = require('../index');
const qiniu_config = require('./resource/qiniu.config');
const qiniu = new Qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

// 测试常量
const CONST = {
  bucketName: null,
  fileName: 'sliceUpload.test.zip',
  scope: null
};

describe('自定义扩展方法测试', function(){
  this.timeout(30000);
  before(async function(){

    // 下载sliceUpload并发分片上传的测试文件
    await common.testFile('sliceUpload.test.zip');

    // 随机个名字
    CONST.bucketName = new Date().getTime() + '';
    CONST.scope = CONST.bucketName + ':' + CONST.fileName;

    let result = await qiniu.bucket(CONST.bucketName).mk();
    debug('创建bucket：%s并返回：%s', CONST.bucketName, JSON.stringify(result));
  });
  it('sliceUpload并发分片上传', async function(){
    let result;
    try {
      result = await qiniu.file(CONST.scope).sliceUpload({ path: __dirname + '/resource/sliceUpload.test.zip', max: 2 });
    } catch (error) {
      console.log(error)
    }
    debug('sliceUpload并发分片上传并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.hash).to.be.a('string');
    expect(result.key).to.be.a('string');
  });
  after(async function(){
    let result = await qiniu.bucket(CONST.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
});