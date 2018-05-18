try {
  const qiniu_config = require('./resource/qiniu.config');
} catch (error) {
  throw new Error(`
  先配置你的/test/resource/qiniu.config.json文件再测试
  qiniu.config.json是放置AccessKey和SecretKey的配置文件
  格式与qiniu.config.default.json相同，你需要配置你的qiniu.config.json
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
describe('file.image 相关方法测试', function(){
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

      // 上传README.md
      let r3 = await qiniu.file(common.scope).upload(require('path').join(__dirname, '../README.md'));
      debug('上传README.md返回：%s', JSON.stringify(r3));
      // 文件路径
      common.url = common.domain + '/' + common.fileName;
      done();
    })();
  });
  // it('resource.qhash 文件HASH值', function(done){
  //   Qiniu.resource.qhash(common.url, 'md5')
  //   .then(function(result){
  //     debug('返回：%s',JSON.stringify(result));
  //     expect(result).to.be.an('object')
  //     done();
  //   })
  //   .catch(console.error);
  // });
  // it('resource.md2html markdown=>html', function(done){
  //   Qiniu.resource.md2html(common.url)
  //   .then(function(result){
  //     debug('返回：%s',JSON.stringify(result));
  //     expect(result.indexOf('</h1>') > -1).to.be.ok;
  //     done();
  //   })
  //   .catch(console.error);
  // });
  it('resource.qrcode', function(done){
    Qiniu.resource.qrcode(common.url, { path: __dirname + '/resource/qrcode.test.png' })
    .then(function(result){
      debug('返回：%s',JSON.stringify(result));
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