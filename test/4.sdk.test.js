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
describe('SDK 相关方法测试', function(){
  this.timeout(20000);
  before(async function(){
    // 随机个名字
    common.bucketName = new Date().getTime() + '';
    let result = await qiniu.bucket(common.bucketName).mk()
    debug('创建bucket：%s并返回：%s', common.bucketName, JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('buckets 获取 Bucket 列表', async function(){
    let result = await qiniu.buckets();
    debug('获取 Bucket 列表并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('array');
  });
  it('sisyphus 异步第三方资源抓取', async function(){
    let result = await qiniu.sisyphus({
      body: {
        url: [
          'https://www.baidu.com/img/bd_logo1.png?qua=high',
          'https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=3436665273,1985018126&fm=58&w=200&h=200&img.JPEG'
        ],
        bucket: common.bucketName
      }
    });
    debug('异步第三方资源抓取并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('batch 批量操作', async function(){
    // 不需要管是否操作成功了
    // 只要有正确的返回数据就可以了
    let ops = [
      { _type: 'move', bucket: common.bucketName, fileName: 'test.png', dest: 'test-1.png', force: false },
      { _type: 'copy',bucket: common.bucketName,fileName: 'test2.png',dest: 'test-2.png',force: false },
      { _type: 'chtype', bucket: common.bucketName, fileName: 'test3.png', type: 1 },
      { _type: 'stat', bucket: common.bucketName, fileName: 'test-1.png' },
      { _type: 'delete', bucket: common.bucketName,fileName: 'test.js' }
    ]
    let result = await qiniu.batch({ ops: ops });
    debug('批量操作并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(ops.length === result.length).to.be.ok;
    expect(result).to.be.an('array');
  });
  after(async function(){
    let result = await qiniu.bucket(common.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
});