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

describe('video 相关方法测试', function(){
  this.timeout(20000);
  it('review 视频三鉴', async function(){
    vid = Date.now().toString();
    let result = await Qiniu.video.review({
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
    let result = await Qiniu.video.job({
      sdk: qiniu,
      job_id: job_id
    });
    debug('job 获取单个视频的识别结果并返回：%s', JSON.stringify(result));
    expect(result.error).to.be.undefined;
    expect(result.id === job_id).to.be.ok;
    expect(result.vid === vid).to.be.ok;
  });
});