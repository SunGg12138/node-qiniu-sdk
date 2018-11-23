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
  bucketName: null
};

describe('Bucket 相关方法测试', function(){
  this.timeout(20000);
  before(function(){
    // 随机个名字
    common.bucketName = new Date().getTime() + '';
  });
  it('zone 切换区域', async function(){
    // 来回切换一次区域
    let bucket = qiniu.bucket(common.bucketName);
    // 默认区域
    expect(bucket.zone === 'z0').to.be.ok;
    bucket.tabZone('z2');
    expect(bucket.zone === 'z2').to.be.ok;
  });
  it('mk 创建 Bucket', async function(){
    let result = await qiniu.bucket(common.bucketName).mk();
    debug('创建bucket：%s并返回：%s', common.bucketName, JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('image 设置 Bucket 镜像源', async function(){
    let result = await qiniu.bucket(common.bucketName).image('http://p0vquqra2.bkt.clouddn.com');
    debug('设置Bucket镜像源并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('private 设置 Bucket 访问权限', async function(){
    let result = await qiniu.bucket(common.bucketName).private(1)
    debug('设置Bucket访问权限并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('domain 获取 Bucket 空间域名', async function(){
    let result = await qiniu.bucket(common.bucketName).domain();
    debug('获取Bucket空间域名并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('array');
  });
  it('list 资源列举', async function(){
    let result = await qiniu.bucket(common.bucketName).list({ limit: 100 });
    debug('资源列举并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('object');
    expect(result.items).to.be.an('array');
  });
  it('drop 删除 Bucket', async function(){
    let result = await qiniu.bucket(common.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('object');
  });
});