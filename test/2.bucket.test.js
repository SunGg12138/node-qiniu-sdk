const common = require('./common');
// 检查是否已经配置好了qiniu.config文件
common.beforeTest();

const expect = require('chai').expect;
const debug = require('debug')('test');
const Qiniu = require('../index');
const qiniu_config = require('./resource/qiniu.config');
const qiniu = new Qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

const CONST = {
  bucketName: null
};

describe('Bucket 相关方法测试', function(){
  this.timeout(20000);
  before(function(){
    // 随机个名字
    CONST.bucketName = new Date().getTime() + '';
  });
  it('zone 切换区域', async function(){
    // 来回切换一次区域
    let bucket = qiniu.bucket(CONST.bucketName);
    // 默认区域
    expect(bucket.zone === 'z0').to.be.ok;
    bucket.tabZone('z2');
    expect(bucket.zone === 'z2').to.be.ok;
  });
  it('mk 创建 Bucket', async function(){
    let result = await qiniu.bucket(CONST.bucketName).mk();
    debug('创建bucket：%s并返回：%s', CONST.bucketName, JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('image 设置 Bucket 镜像源', async function(){
    let result = await qiniu.bucket(CONST.bucketName).image('http://p0vquqra2.bkt.clouddn.com');
    debug('设置Bucket镜像源并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('private 设置 Bucket 访问权限', async function(){
    let result = await qiniu.bucket(CONST.bucketName).private(1)
    debug('设置Bucket访问权限并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('domain 获取 Bucket 空间域名', async function(){
    let result = await qiniu.bucket(CONST.bucketName).domain();
    debug('获取Bucket空间域名并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('array');
  });
  it('list 资源列举', async function(){
    let result = await qiniu.bucket(CONST.bucketName).list({ limit: 100 });
    debug('资源列举并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('object');
    expect(result.items).to.be.an('array');
  });
  it('drop 删除 Bucket', async function(){
    let result = await qiniu.bucket(CONST.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('object');
  });
});