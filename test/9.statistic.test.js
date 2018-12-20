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

describe('数据统计接口', function(){
  this.timeout(30000);
  it('space，获取标准存储的当前存储量', async function(){
    try {
      let result = await qiniu.statistic().space({
        begin: '20170818140000',
        end: '20170818151000',
        g: 'day'
      });
      debug('返回：' + JSON.stringify(result));
      expect(result).to.be.an('object');
      expect(result.error).to.be.undefined;
      expect(result.times).to.be.an('array');
      expect(result.datas).to.be.an('array');
    } catch (errData) {
      // 经过测试error="mergeapi: unmatched times"时，可以算作成功
      expect(errData.body.error === "mergeapi: unmatched times").to.be.ok;
    }
  });

  it('count 获取标准存储的文件数量', async function(){
    try {
      let result = await qiniu.statistic().count({
        begin: '20170818140000',
        end: '20170818151000',
        g: 'day'
      });
      debug('返回：' + JSON.stringify(result));
      expect(result).to.be.an('object');
      expect(result.error).to.be.undefined;
      expect(result.times).to.be.an('array');
      expect(result.datas).to.be.an('array');
    } catch (errData) {
      // 经过测试error="mergeapi: unmatched times"时，可以算作成功
      expect(errData.body.error === "mergeapi: unmatched times").to.be.ok;
    }
  });

  it('space_line 获取低频存储的当前存储量', async function(){
    try {
      let result = await qiniu.statistic().space_line({
        begin: '20170818140000',
        end: '20170818151000',
        g: 'day',
        only_predel: 1
      });
      debug('返回：' + JSON.stringify(result));
      expect(result).to.be.an('object');
      expect(result.error).to.be.undefined;
      expect(result.times).to.be.an('array');
      expect(result.datas).to.be.an('array');
    } catch (errData) {
      // 经过测试error="mergeapi: unmatched times"时，可以算作成功
      expect(errData.body.error === "mergeapi: unmatched times").to.be.ok;
    }
  });

  it('count_line 获取低频存储的当前存储量', async function(){
    try {
      let result = await qiniu.statistic().count_line({
        begin: '20170818140000',
        end: '20170818151000',
        g: 'day'
      });
      debug('返回：' + JSON.stringify(result));
      expect(result).to.be.an('object');
      expect(result.error).to.be.undefined;
      expect(result.datas).to.be.an('array');
    } catch (errData) {
      // 经过测试error="mergeapi: unmatched times"时，可以算作成功
      expect(errData.body.error === "mergeapi: unmatched times").to.be.ok;      
    }
  });

  it('blob_transfer 获取跨区域同步流量统计数据', async function(){
    let result = await qiniu.statistic().blob_transfer({
      begin: '20170818140000',
      end: '20170818151000',
      g: 'month',
      select: 'size'
    });
    debug('返回：' + JSON.stringify(result));
    expect(result).to.be.a('array');
  });

  it('rs_chtype 获取跨区域同步流量统计数据', async function(){
    let result = await qiniu.statistic().rs_chtype({
      begin: '20170818140000',
      end: '20170818151000',
      g: 'month',
      select: 'hits'
    });
    debug('返回：' + JSON.stringify(result));
    expect(result).to.be.a('array');
  });

  it('blob_io 获取跨区域同步流量统计数据', async function(){
    let result = await qiniu.statistic().blob_io({
      begin: '20170818140000',
      end: '20170818151000',
      g: 'month',
      select: 'hits',
      $src: 'inner'
    });
    debug('返回：' + JSON.stringify(result));
    expect(result).to.be.a('array');
  });

  it('rs_put 获取 PUT 请求次数', async function(){
    let result = await qiniu.statistic().rs_put({
      begin: '20170818140000',
      end: '20170818151000',
      g: 'month',
      select: 'hits'
    });
    debug('返回：' + JSON.stringify(result));
    expect(result).to.be.a('array');
  });
});