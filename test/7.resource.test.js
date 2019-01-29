const common = require('./common');
// 检查是否已经配置好了qiniu.config文件
common.beforeTest();

const expect = require('chai').expect;
const debug = require('debug')('test');
const Qiniu = require('../index');
const qiniu_config = require('./resource/qiniu.config');
const qiniu = new Qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

const CONST = {
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
    CONST.bucketName = new Date().getTime() + '';
    CONST.scope = CONST.bucketName + ':' + CONST.fileName;

    // 创建储存空间
    let r1 = await qiniu.bucket(CONST.bucketName).mk();
    debug('创建bucket：%s并返回：%s', CONST.bucketName, JSON.stringify(r1));

    // 获取空间域名
    let r2 = await qiniu.bucket(CONST.bucketName).domain();
    debug('获取空间域名返回：%s', JSON.stringify(r2));
    CONST.domain = 'http://' + r2[0];

    // 上传README.md
    let r3 = await qiniu.file(CONST.scope).upload(require('path').join(__dirname, '../README.md'));
    debug('上传README.md返回：%s', JSON.stringify(r3));

    // 上传README2.md
    let r4 = await qiniu.file(CONST.bucketName + ':README2.md').upload(require('path').join(__dirname, '../README.md'));
    debug('上传README2.md返回：%s', JSON.stringify(r4));

    // 文件路径
    CONST.url = CONST.domain + '/' + CONST.fileName;
  });
  it('resource.qhash 文件HASH值', async function(){
    let result = await Qiniu.resource.qhash(CONST.url, 'md5');
    debug('返回：%s',JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('resource.md2html markdown=>html', async function(){
    let result = await Qiniu.resource.md2html(CONST.url);
    debug('返回：%s',JSON.stringify(result));
    expect(result.indexOf('</h1>') > -1).to.be.ok;
  });
  it('resource.concat 合并文件', async function(){
    let result = await Qiniu.resource.concat({
      mimeType: 'text/markdown',
      urls: [
        CONST.domain + '/README.md',
        CONST.domain + '/README2.md'
      ],
      saveas: {
        bucketName: CONST.bucketName,
        fileName: 'README.concat.md'
      },
      pfop: qiniu.pfop({
        bucketName: CONST.bucketName,
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
        CONST.domain + '/README.md',
        CONST.domain + '/README2.md'
      ],
      saveas: {
        bucketName: CONST.bucketName,
        fileName: 'README.mkzip.zip'
      },
      pfop: qiniu.pfop({
        bucketName: CONST.bucketName,
        fileName: 'README.md'
      })
    });
    debug('mkzip返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('resource.qrcode 处理后的二维码保存到本地', async function(){
    let result = await Qiniu.resource.qrcode(CONST.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 },
      path: __dirname + '/resource/qrcode.test.png'
    });
    debug('返回：%s',JSON.stringify(result));

    if (!result) expect(result).to.be.undefined;
    if (result) expect(result.error).to.be.undefined;
  });
  it('resource.qrcode 处理后的二维码保存到储存空间', async function(){
    let result = await Qiniu.resource.qrcode(CONST.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 },
      saveas: qiniu.saveas(CONST.bucketName, 'qrcode.processing.jpg')
    });
    debug('返回：%s',JSON.stringify(result));
    expect(result.error).to.be.undefined;
  });
  after(async function(){
    let result = await qiniu.bucket(CONST.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
});