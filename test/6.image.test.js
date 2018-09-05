try {
  const qiniu_config = require('./resource/qiniu.config');
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
  fileName: 'image.test.jpg',
  scope: null,
  domain: null,
  url: null
};
describe('image 相关方法测试', function(){
  this.timeout(20000);
  before(function(done){
    // 随机个名字
    common.bucketName = new Date().getTime() + '';
    common.scope = common.bucketName + ':' + common.fileName;

    (async function(){
      // 创建储存空间
      let r1 = await qiniu.bucket(common.bucketName).mk();
      debug('创建bucket：%s并返回：%s', common.bucketName, JSON.stringify(r1));

      // 获取空间域名
      let r2 = await qiniu.bucket(common.bucketName).domain();
      debug('获取空间域名返回：%s', JSON.stringify(r2));
      common.domain = 'http://' + r2[0];

      // 上传图片
      let r3 = await qiniu.file(common.scope).upload(__dirname + '/resource/file.image.test.jpg');
      debug('上传图片返回：%s', JSON.stringify(r3));
      // 文件路径
      common.url = common.domain + '/' + common.fileName;
      done();
    })();
  });
  it('imageInfo 图片基本信息', function(done){
    Qiniu.image.imageInfo(common.url)
    .then(function(result){
      debug('返回：%s',JSON.stringify(result));
      expect(result).to.be.an('object')
      done();
    })
    .catch(console.error);
  });
  it('exif 图片EXIF信息', function(done){
    Qiniu.image.exif(common.url)
    .then(function(result){
      debug('返回：%s',JSON.stringify(result));
      expect(result).to.be.an('object')
      done();
    })
    .catch(console.error);
  });
  it('imageAve 图片平均色调', function(done){
    Qiniu.image.imageAve(common.url)
    .then(function(result){
      debug('返回：%s',JSON.stringify(result));
      expect(result).to.be.an('object')
      done();
    })
    .catch(console.error);
  });
  it('pulp 图像鉴黄', function(done){
    Qiniu.image.pulp(common.url)
    .then(function(result){
      debug('pulp 图像鉴黄并返回：%s', JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('terror 图片鉴暴恐', function(done){
    Qiniu.image.terror(common.url)
    .then(function(result){
      debug('terror 图片鉴暴恐并返回：%s', JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('politician 政治人物识别', function(done){
    Qiniu.image.politician(common.url)
    .then(function(result){
      debug('politician 政治人物识别并返回：%s', JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('review 图像审核', function(done){
    Qiniu.image.review({
      uri: common.url,
      sdk: qiniu
    })
    .then(function(result){
      debug('review图像审核并返回：%s', JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('processing 获取图像处理的链接', function(done){
    Qiniu.image.processing(common.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 }
    })
    .then(function(result){
      debug('返回：%s',JSON.stringify(result));
      expect(result).to.be.a('string');
      done();
    })
    .catch(console.error);
  });
  it('processing 图像处理后保存到本地', function(done){
    Qiniu.image.processing(common.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 },
      path: __dirname + '/resource/processing.test.jpg'
    })
    .then(function(result){
      debug('返回：%s',JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('processing 图像处理后保存到储存空间', function(done){
    Qiniu.image.processing(common.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 },
      saveas: qiniu.saveas(common.bucketName, 'processing.jpg')
    })
    .then(function(result){
      debug('返回：%s',JSON.stringify(result));
      expect(result).to.be.an('object');
      done();
    })
    .catch(console.error);
  });
  after(function(done){
    qiniu.bucket(common.bucketName)
    .drop()
    .then(function(result){
      debug('删除Bucket并返回：%s', JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
});