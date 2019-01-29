const common = require('./common');
// 检查是否已经配置好了qiniu.config文件
common.beforeTest();

const fs = require('fs');
const expect = require('chai').expect;
const debug = require('debug')('test');
const Qiniu = require('../index');
const qiniu_config = require('./resource/qiniu.config');
const qiniu = new Qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

const CONST = {
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
  this.timeout(40000);

  before(async function(){
    
    // 下载av.mp4测试文件
    await common.testFile('av.mp4');

    // 随机个名字
    CONST.bucketName = new Date().getTime() + '';
    CONST.scope = CONST.bucketName + ':' + CONST.fileName;

    // 创建储存空间
    let r1 = await qiniu.bucket(CONST.bucketName).mk();
    debug('创建bucket：%s并返回：%s', CONST.bucketName, JSON.stringify(r1));

    // 上传视频
    let r2 = await qiniu.file(CONST.scope).upload(__dirname + '/resource/av.mp4');
    debug('上传视频返回：%s', JSON.stringify(r2));

    // 获取空间域名
    let r3 = await qiniu.bucket(CONST.bucketName).domain();
    debug('获取空间域名返回：%s', JSON.stringify(r3));
    CONST.domain = 'http://' + r3[0];

    // 文件路径
    CONST.url = CONST.domain + '/' + CONST.fileName;
  });

  it('review 视频三鉴', async function(){
    vid = Date.now().toString();
    let result = await Qiniu.av.review({
      vid: vid,
      sdk: qiniu,
      body: {
        data: {
          uri: 'https://raw.githubusercontent.com/SunGg12138/node-qiniu-sdk-resource/master/av.mp4'
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

  it('jobs 获取单个视频的识别结果', async function(){
    let result = await Qiniu.av.jobs({
      sdk: qiniu,
      job_id: job_id
    });
    debug('job 获取单个视频的识别结果并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result.id === job_id).to.be.ok;
    expect(result.vid === vid).to.be.ok;
  });

  it('jobs 获取所有任务', async function(){
    let result = await Qiniu.av.jobs({
      sdk: qiniu
    });
    debug('job 获取所有任务结果并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('array');
  });

  it('jobs 获取指定状态的任务', async function(){
    let result = await Qiniu.av.jobs({
      sdk: qiniu,
      status: 'RESCHEDULED'
    });
    debug('jobs 获取指定状态的任务并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('array');
  });

  it('avsmart 锐智转码', async function(){
    let result = await Qiniu.av.avsmart({
      pfop: qiniu.pfop({
        bucketName: CONST.bucketName,
        fileName: CONST.fileName,
      }),
      saveas: {
        bucketName: CONST.bucketName,
        fileName: CONST.avsmartFileName,
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
        bucketName: CONST.bucketName,
        fileName: CONST.fileName,
      }),
      saveas: {
        bucketName: CONST.bucketName,
        fileName: CONST.avthumbFileName,
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
        bucketName: CONST.bucketName,
        fileName: CONST.fileName,
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
        bucketName: CONST.bucketName,
        fileName: CONST.fileName,
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
        bucketName: CONST.bucketName,
        fileName: CONST.fileName,
      }),
      saveas: {
        bucketName: CONST.bucketName,
        fileName: CONST.watermarkFileName,
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
        bucketName: CONST.bucketName,
        fileName: CONST.fileName,
      }),
      saveas: {
        bucketName: CONST.bucketName,
        fileName: CONST.concatFileName,
      },
      format: 'mp4',
      urls: [
        'https://raw.githubusercontent.com/SunGg12138/node-qiniu-sdk-resource/master/av.mp4'
      ]
    });
    debug('concat 音视频拼接并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.persistentId).to.be.a('string');

    // 查看fop的请求状态
    // 接口响应code：https://developer.qiniu.com/dora/manual/5135/avsmart#4
    let status = await Qiniu.fopStatus(result.persistentId);
    debug('concat 查看fop的请求状态并返回：%s', JSON.stringify(status));
    expect(status.code === 0 || status.code === 1 || status.code === 2).to.be.ok;
  });

  it('avinfo 音视频元信息', async function(){
    let result = await Qiniu.av.avinfo(CONST.url);
    debug('avinfo 音视频元信息并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
  });

  it('vframe 视频帧缩略图', async function(){
    let result = await Qiniu.av.vframe({
      pfop: qiniu.pfop({
        bucketName: CONST.bucketName,
        fileName: CONST.fileName,
      }),
      saveas: {
        bucketName: CONST.bucketName,
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
        bucketName: CONST.bucketName,
        fileName: CONST.fileName,
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
        bucketName: CONST.bucketName,
        fileName: CONST.fileName,
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
    let r1 = await qiniu.bucket(CONST.bucketName).private(1);
    debug('设置Bucket访问权限并返回：%s', JSON.stringify(r1));

    let r2 = await Qiniu.av.pm3u8({
      url: CONST.domain + '/adapt_test-a.m3u8',
      qiniu: qiniu,
      path: __dirname + '/resource/pm3u8.txt'
    });
    debug('pm3u8 私有M3U8并返回：%s', JSON.stringify(r2));
    
    let data = fs.readFileSync(__dirname + '/resource/pm3u8.txt');
    data = data.toString();
    expect(data.indexOf('adapt_test-a_000000.ts') > -1).to.be.ok;
  });
  
  after(async function(){
    let result = await qiniu.bucket(CONST.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
});