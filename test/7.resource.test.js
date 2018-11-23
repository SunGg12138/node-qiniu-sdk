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
  fileName: 'README.md',
  scope: null,
  domain: null,
  url: null
};
describe('resource 相关方法测试', function(){
  this.timeout(20000);
  before(async function(){
    // 随机个名字
    common.bucketName = new Date().getTime() + '';
    common.scope = common.bucketName + ':' + common.fileName;

    // 创建储存空间
    let r1 = await qiniu.bucket(common.bucketName).mk();
    debug('创建bucket：%s并返回：%s', common.bucketName, JSON.stringify(r1));

    // 获取空间域名
    let r2 = await qiniu.bucket(common.bucketName).domain();
    debug('获取空间域名返回：%s', JSON.stringify(r2));
    common.domain = 'http://' + r2[0];

    // 上传README.md
    let r3 = await qiniu.file(common.scope).upload(require('path').join(__dirname, '../README.md'));
    debug('上传README.md返回：%s', JSON.stringify(r3));

    // 上传README2.md
    let r4 = await qiniu.file(common.bucketName + ':README2.md').upload(require('path').join(__dirname, '../README.md'));
    debug('上传README2.md返回：%s', JSON.stringify(r4));

    // 文件路径
    common.url = common.domain + '/' + common.fileName;
  });
  it('resource.qhash 文件HASH值', async function(){
    let result = await Qiniu.resource.qhash(common.url, 'md5');
    debug('返回：%s',JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('resource.md2html markdown=>html', async function(){
    let result = await Qiniu.resource.md2html(common.url);
    debug('返回：%s',JSON.stringify(result));
    expect(result.indexOf('</h1>') > -1).to.be.ok;
  });
  it('resource.concat 合并文件', async function(){
    let result = await Qiniu.resource.concat({
      mimeType: 'text/markdown',
      urls: [
        common.domain + '/README.md',
        common.domain + '/README2.md'
      ],
      saveas: {
        bucketName: common.bucketName,
        fileName: 'README.concat.md'
      },
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: 'README.md'
      })
    });
    debug('concat返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('resource.mkzip 多文件压缩', async function(){
    let result = await Qiniu.resource.mkzip({
      mode: 2,
      urls: [
        common.domain + '/README.md',
        common.domain + '/README2.md'
      ],
      saveas: {
        bucketName: common.bucketName,
        fileName: 'README.mkzip.zip'
      },
      pfop: qiniu.pfop({
        bucketName: common.bucketName,
        fileName: 'README.md'
      })
    });
    debug('mkzip返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('resource.qrcode 处理后的二维码保存到本地', async function(){
    let result = await Qiniu.resource.qrcode(common.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 },
      path: __dirname + '/resource/qrcode.test.png'
    });
    debug('返回：%s',JSON.stringify(result));
    expect(result.error).to.be.undefined;
  });
  it('resource.qrcode 处理后的二维码保存到储存空间', async function(){
    let result = await Qiniu.resource.qrcode(common.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 },
      saveas: qiniu.saveas(common.bucketName, 'qrcode.processing.jpg')
    });
    debug('返回：%s',JSON.stringify(result));
    expect(result.error).to.be.undefined;
  });
  after(async function(){
    let result = await qiniu.bucket(common.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
});