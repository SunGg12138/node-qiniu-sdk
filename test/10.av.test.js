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

const fs = require('fs');
const expect = require('chai').expect;
const debug = require('debug')('test');
const Qiniu = require('../index');
const qiniu_config = require('./resource/qiniu.config');
const qiniu = new Qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

const common = {
  bucketName: null,
  fileName: 'av.mp4',
  avsmartFileName: 'av_avsmart.mp4',
  avthumbFileName: 'av_avthumb.mp4',
  watermarkFileName: 'av_watermark.mp4',
  concatFileName: 'av_concat.mp4',
  scope: null,
  domain: null,
  url: null
};
describe('av 相关方法测试', function(){
  this.timeout(30000);

  before(async function(){
    // 随机个名字
    common.bucketName = new Date().getTime() + '';
    common.scope = common.bucketName + ':' + common.fileName;

    // 创建储存空间
    let r1 = await qiniu.bucket(common.bucketName).mk();
    debug('创建bucket：%s并返回：%s', common.bucketName, JSON.stringify(r1));

    // 上传视频
    let r2 = await qiniu.file(common.scope).upload(__dirname + '/resource/av.mp4');
    debug('上传视频返回：%s', JSON.stringify(r2));

    // 获取空间域名
    let r3 = await qiniu.bucket(common.bucketName).domain();
    debug('获取空间域名返回：%s', JSON.stringify(r3));
    common.domain = 'http://' + r3[0];

    // 文件路径
    common.url = common.domain + '/' + common.fileName;
  });

  it('review 视频三鉴', async function(){
    vid = Date.now().toString();
    let result = await Qiniu.av.review({
      vid: vid,
      sdk: qiniu,
      body: {
        data: {
          uri: 'http://pimnrbs1q.bkt.clouddn.com/v0200f5b0000bfsda182sajfu4jn53ng.mp4'
        },
        params: {
          async: true
        },
        ops: [
          { op: 'pulp' },
          { op: 'terror' },
          { op: 'politician' }
        ]
      }
    });
    debug('review 视频三鉴并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.job).to.be.a('string');

    job_id = result.job;
  });

  it('job 获取单个视频的识别结果', async function(){
    let result = await Qiniu.av.job({
      sdk: qiniu,
      job_id: job_id
    });
    debug('job 获取单个视频的识别结果并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result.id === job_id).to.be.ok;
    expect(result.vid === vid).to.be.ok;
  });

  it('avsmart 锐智转码', async function(){
    let result = await Qiniu.av.avsmart({
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: common.fileName,
      }),
      saveas: {
        bucketName: common.bucketName,
        fileName: common.avsmartFileName,
      }
    });
    debug('avsmart 锐智转码并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.persistentId).to.be.a('string');

    // 查看fop的请求状态
    // 接口响应code：https://developer.qiniu.com/dora/manual/5135/avsmart#4
    let status = await Qiniu.fopStatus(result.persistentId);
    expect(status.code === 0 || status.code === 1 || status.code === 2).to.be.ok;
  });

  it('avthumb 普通音视频转码', async function(){
    let result = await Qiniu.av.avthumb({
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: common.fileName,
      }),
      saveas: {
        bucketName: common.bucketName,
        fileName: common.avthumbFileName,
      },
      format: 'mp4',
      vb: '1.25m'
    });
    debug('avthumb 普通音视频转码并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.persistentId).to.be.a('string');

    // 查看fop的请求状态
    // 接口响应code：https://developer.qiniu.com/dora/manual/5135/avsmart#4
    let status = await Qiniu.fopStatus(result.persistentId);
    expect(status.code === 0 || status.code === 1 || status.code === 2).to.be.ok;
  });

  it('segment 音视频分段', async function(){
    let result = await Qiniu.av.segment({
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: common.fileName,
      }),
      format: 'mp4',
      segtime: 5,
      pattern: 'test-$(count).mp4'
    });
    debug('segment 音视频分段并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.persistentId).to.be.a('string');

    // 查看fop的请求状态
    // 接口响应code：https://developer.qiniu.com/dora/manual/5135/avsmart#4
    let status = await Qiniu.fopStatus(result.persistentId);
    expect(status.code === 0 || status.code === 1 || status.code === 2).to.be.ok;
  });

  it('hls 音视频切片（HLS）', async function(){
    let result = await Qiniu.av.hls({
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: common.fileName,
      }),
      noDomain: '1',
      format: 'mp4',
      segtime: 5,
      pattern: 'test_hls-$(count).mp4'
    });
    debug('hls 音视频切片（HLS）并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.persistentId).to.be.a('string');

    // 查看fop的请求状态
    // 接口响应code：https://developer.qiniu.com/dora/manual/5135/avsmart#4
    let status = await Qiniu.fopStatus(result.persistentId);
    expect(status.code === 0 || status.code === 1 || status.code === 2).to.be.ok;
  });

  it('watermark 视频水印', async function(){
    let result = await Qiniu.av.watermark({
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: common.fileName,
      }),
      saveas: {
        bucketName: common.bucketName,
        fileName: common.watermarkFileName,
      },
      format: 'mp4',
      vb: '1.25m',
      wmImage: 'https://odum9helk.qnssl.com/qiniu-logo.png'
    });
    debug('watermark 视频水印并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.persistentId).to.be.a('string');

    // 查看fop的请求状态
    // 接口响应code：https://developer.qiniu.com/dora/manual/5135/avsmart#4
    let status = await Qiniu.fopStatus(result.persistentId);
    expect(status.code === 0 || status.code === 1 || status.code === 2).to.be.ok;
  });

  it('concat 音视频拼接', async function(){
    let result = await Qiniu.av.concat({
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: common.fileName,
      }),
      saveas: {
        bucketName: common.bucketName,
        fileName: common.concatFileName,
      },
      format: 'mp4',
      urls: [
        'http://pimnrbs1q.bkt.clouddn.com/av'
      ]
    });
    debug('concat 音视频拼接并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.persistentId).to.be.a('string');

    // 查看fop的请求状态
    // 接口响应code：https://developer.qiniu.com/dora/manual/5135/avsmart#4
    let status = await Qiniu.fopStatus(result.persistentId);
    expect(status.code === 0 || status.code === 1 || status.code === 2).to.be.ok;
  });

  it('avinfo 音视频元信息', async function(){
    let result = await Qiniu.av.avinfo(common.url);
    debug('avinfo 音视频元信息并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
  });

  it('vframe 视频帧缩略图', async function(){
    let result = await Qiniu.av.vframe({
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: common.fileName,
      }),
      saveas: {
        bucketName: common.bucketName,
        fileName: 'av.png',
      },
      offset: 1,
      format: 'png',
      rotate: 180
    });
    debug('vframe 视频帧缩略图并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.persistentId).to.be.a('string');

    // 查看fop的请求状态
    // 接口响应code：https://developer.qiniu.com/dora/manual/5135/avsmart#4
    let status = await Qiniu.fopStatus(result.persistentId);
    expect(status.code === 0 || status.code === 1 || status.code === 2).to.be.ok;
  });

  it('vsample 视频采样缩略图', async function(){
    let result = await Qiniu.av.vsample({
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: common.fileName,
      }),
      pattern: 'vframe-$(count).png',
      ss: '0',
      format: 'png',
      t: '10'
    });
    debug('vsample 视频采样缩略图并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.persistentId).to.be.a('string');

    // 查看fop的请求状态
    // 接口响应code：https://developer.qiniu.com/dora/manual/5135/avsmart#4
    let status = await Qiniu.fopStatus(result.persistentId);
    expect(status.code === 0 || status.code === 1 || status.code === 2).to.be.ok;
  });

  it('avvod 实时音视频转码', async function(){
    let result = await Qiniu.av.avvod({
      ab: '64k',
      r: '24'
    });
    debug('avvod 实时音视频转码并返回：%s', JSON.stringify(result));
    expect(result).to.be.a('string');
  });

  it('adapt 多码率自适应转码', async function(){
    let result = await Qiniu.av.adapt({
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: common.fileName,
      }),
      envBandWidth: '200000,800000',
      multiPrefix: [
        'adapt_test-a', 'adapt_test-b'
      ]
    });
    debug('adapt 多码率自适应转码并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.persistentId).to.be.a('string');

    // 查看fop的请求状态
    // 接口响应code：https://developer.qiniu.com/dora/manual/5135/avsmart#4
    let status = await Qiniu.fopStatus(result.persistentId);
    expect(status.code === 0 || status.code === 1 || status.code === 2).to.be.ok;

    adapt_persistentId = result.persistentId;
  });

  it('pm3u8 私有M3U8', async function(){

    await new Promise(resolve => {
      let timer = setInterval(async () => {
        let status = await Qiniu.fopStatus(adapt_persistentId);
        if (status.code === 0) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });

    // 必须要设置私有化，否则会报错
    let r1 = await qiniu.bucket(common.bucketName).private(1);
    debug('设置Bucket访问权限并返回：%s', JSON.stringify(r1));

    let r2 = await Qiniu.av.pm3u8({
      url: common.domain + '/adapt_test-a.m3u8',
      qiniu: qiniu,
      pipe: fs.createWriteStream(__dirname + '/resource/pm3u8.txt')
    });
    debug('pm3u8 私有M3U8并返回：%s', JSON.stringify(r2));
    
    let data = fs.readFileSync(__dirname + '/resource/pm3u8.txt');
    data = data.toString();
    expect(data.indexOf('adapt_test-a_000000.ts') > -1).to.be.ok;
  });
  
  after(async function(){
    let result = await qiniu.bucket(common.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
});