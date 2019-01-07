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
describe('CND 相关方法测试', function(){
  this.timeout(20000);
  before(async function(){
    // 随机个名字
    common.bucketName = new Date().getTime() + '';
    let result = await qiniu.bucket(common.bucketName).mk();
    debug('创建bucket：%s并返回：%s', common.bucketName, JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('CDN.log 日志下载', async function(){
    let domains = common.domains || await qiniu.bucket(common.bucketName).domain();
    common.domains = domains;

    let result = await qiniu.cdn.log('2018-05-14', domains);

    debug('日志下载并返回：%s', JSON.stringify(result));
    
    expect(result).to.be.an('object');
    expect(result.code === 200).to.be.ok;
  });
  it('CDN.loganalyze 日志分析', async function(){
    try {
      let domains = common.domains || await qiniu.bucket(common.bucketName).domain();
      common.domains = domains;
      let result;

      result = await qiniu.cdn.loganalyze({
        _type: 'statuscode', domains, freq: '5min', startDate: '2018-05-13', endDate: '2018-05-14'
      });
      debug('批量查询状态码并返回：%s', JSON.stringify(result));
      expect(result.code === 200).to.be.ok;
      
      result = await qiniu.cdn.loganalyze({
        _type: 'hitmiss', domains, freq: '5min', startDate: '2018-05-13', endDate: '2018-05-14'
      });
      debug('批量查询命中率并返回：%s', JSON.stringify(result));
      expect(result.code === 200).to.be.ok;

      result = await qiniu.cdn.loganalyze({
        _type: 'topcountip', domains, region: 'global', startDate: '2018-05-13', endDate: '2018-05-14'
      });
      debug('批量请求访问次数 Top IP并返回：%s', JSON.stringify(result));
      expect(result.code === 200).to.be.ok;
    } catch (error) {
      return Promise.reject(error);
    }
  });
  it('CDN.refresh 刷新', async function(){
    // 官方网站注意事项: 输入参数可选部分全部为空时，服务端返回无效参数错误。
    // 使用空的数组测试，因为每日的刷新次数是有限的
    let result = await qiniu.cdn.refresh({ urls: [], dirs: [] });
    debug('刷新并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 200 || result.code === 400000).to.be.ok;
  });
  it('CDN.refreshList 刷新查询', async function(){
    let result = await qiniu.cdn.refreshList({ urls: [] });
    debug('刷新查询并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 200).to.be.ok;
  });
  it('CDN.prefetch 预取', async function(){
    // 官方网站注意事项: 输入参数可选部分全部为空时，服务端返回无效参数错误。
    // 使用空的数组测试，因为每日的预取次数是有限的
    let result = await qiniu.cdn.prefetch({ urls: [] });
    debug('预取并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 200 || result.code === 400000).to.be.ok;
  });
  it('CDN.prefetchList 预取查询', async function(){
    let result = await qiniu.cdn.prefetchList({ urls: [] });
    debug('预取并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 200).to.be.ok;
  });
  it('CDN.bandwidth 批量查询cdn带宽', async function(){
    let result = await qiniu.cdn.bandwidth({startDate: '2018-05-10', endDate: '2018-05-15', granularity: '5min', domains: []});
    debug('批量查询cdn带宽并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 200).to.be.ok;
  });
  it('CDN.flux 批量查询cdn流量', async function(){
    let result = await qiniu.cdn.flux({startDate: '2018-05-10', endDate: '2018-05-15', granularity: '5min', domains: []});
    debug('批量查询cdn流量并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 200).to.be.ok;
  });
  after(async function(){
    let result = await qiniu.bucket(common.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
});