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
  bucketName_2: null,
  fileName: 'f.js',
  scope: null
};
describe('File 相关方法测试', function () {
  this.timeout(20000);
  before(async function () {
    // 随机个名字
    common.bucketName = new Date().getTime() + '';
    common.scope = common.bucketName + ':' + common.fileName;

    let result = await qiniu.bucket(common.bucketName).mk();
    debug('创建bucket：%s并返回：%s', common.bucketName, JSON.stringify(result));

    // 随机个名字
    common.bucketName_2 = new Date().getTime() + '';

    let result2 = await qiniu.bucket(common.bucketName_2).mk();
    debug('创建bucket：%s并返回：%s', common.bucketName_2, JSON.stringify(result2));

    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('tabZone 切换区域', async function () {
    // 来回切换一次区域
    let file = qiniu.file(common.bucketName + ':image.png');
    expect(file.zone === 'z0').to.be.ok;
    file.tabZone('z2');
    expect(file.zone === 'z2').to.be.ok;
  });
  it('upload 使用流上传', async function () {
    let result = await qiniu.file(common.bucketName + ':image.png')
      .upload({ stream: fs.createReadStream(__dirname + '/resource/file.image.test.jpg') });

    debug('使用流上传并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('upload 上传文本', async function () {
    let result = await qiniu.file(common.bucketName + ':upload.txt.js')
      .upload({ txt: 'var a = 12, b = 13, c = 18;' });

    debug('上传文本并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('upload 直传接口', async function () {
    let result = await qiniu.file(common.scope).upload({ path: __filename })
    debug('上传文件并在储存空间的名字为：%s并返回：%s', common.fileName, JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('copy 资源复制', async function () {
    // 官方文档：https://developer.qiniu.com/kodo/api/1254/copy
    // 成功会返回''
    let result = await qiniu.file(common.scope).copy('f_copy.js');
    debug('复制文件并在储存空间的名字为：%s并返回：%s', 'f_copy.js', JSON.stringify(result));
    expect(result === '').to.be.ok
  });
  it('copy 资源复制，跨储存桶测试', async function () {
    // 官方文档：https://developer.qiniu.com/kodo/api/1254/copy
    // 成功会返回''
    let result = await qiniu.file(common.scope).copy(common.bucketName_2 + ':f_copy.js');
    debug('复制文件并在第二个储存空间的名字为：%s并返回：%s', 'f_copy.js', JSON.stringify(result));
    expect(result === '').to.be.ok
  });
  it('move 资源移动／重命名', async function () {
    // 官方文档：https://developer.qiniu.com/kodo/api/1288/move
    // 成功会返回''
    let result = await qiniu.file(common.bucketName + ':f_copy.js').move('f_copy_move.js');
    debug('资源移动／重命名文件并在储存空间的新名字为：%s并返回：%s', 'f_copy_move.js', JSON.stringify(result));
    expect(result === '').to.be.ok
  });
  it('move 资源移动／重命名，跨储存桶测试', async function () {
    // 官方文档：https://developer.qiniu.com/kodo/api/1288/move
    // 成功会返回''
    let result = await qiniu.file(common.bucketName + ':f_copy_move.js').move(common.bucketName_2 + ':f_copy_move_2.js');
    debug('资源移动／重命名文件并在第二个储存空间的新名字为：%s并返回：%s', 'f_copy_move.js', JSON.stringify(result));
    expect(result === '').to.be.ok
  });
  it('chstatus 修改文件状态', async function () {
    // 官方文档：https://developer.qiniu.com/kodo/api/4173/modify-the-file-status
    // 成功会返回''
    // 禁用状态
    let r1 = await qiniu.file(common.scope).chstatus(1);
    debug('修改文件状态并返回：%s', JSON.stringify(r1));
    expect(r1 === '').to.be.ok
    // 启用状态
    let r2 = await qiniu.file(common.scope).chstatus(0);
    debug('修改文件状态并返回：%s', JSON.stringify(r2));
    expect(r2 === '').to.be.ok
  });
  it('deleteAfterDays 更新文件生命周期', async function () {
    // 官方文档：https://developer.qiniu.com/kodo/api/1732/update-file-lifecycle
    // 成功会返回''
    let result = await qiniu.file(common.scope).deleteAfterDays(7);
    debug('更新文件生命周期并返回：%s', JSON.stringify(result));
    expect(result === '').to.be.ok
  });
  it('chtype 修改文件存储类型', async function () {
    // 官方文档：https://developer.qiniu.com/kodo/api/4173/modify-the-file-status
    // 成功会返回''
    let result = await qiniu.file(common.scope).chtype(1);
    debug('修改文件存储类型并返回：%s', JSON.stringify(result));
    expect(result === '').to.be.ok
  });
  it('stat 资源元信息查询', async function () {
    let result = await qiniu.file(common.scope).stat();
    debug('资源元信息查询并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('chgm 资源元信息修改', async function () {
    // 官方文档：https://developer.qiniu.com/kodo/api/1252/chgm
    // 成功会返回''
    let result = await qiniu.file(common.scope).chgm('image/png');
    debug('资源元信息修改并返回：%s', JSON.stringify(result));
    expect(result === '').to.be.ok
  });
  it('fetch 第三方资源抓取', async function () {
    let result = await qiniu.file(common.bucketName + ':fetch.png').fetch('https://qiniu.staticfile.org/static/images/qiniu_logo.5249e634.png');
    debug('第三方资源抓取并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('prefetch 镜像资源更新', async function () {
    try {
      // 获取当前bucket的域名集合
      let common_bucket_domains = await qiniu.bucket(common.bucketName).domain();
      debug('当前bucket的域名集合为：%s', JSON.stringify(common_bucket_domains));

      // 创建新的bucket并设置镜像源为当前bucket
      let newBucketName = new Date().getTime() + '';
      let bucket = qiniu.bucket(newBucketName);

      let r1 = await bucket.mk();
      debug('创建bucket：%s并返回：%s', newBucketName, JSON.stringify(r1));
      expect(r1).to.be.an('object');
      expect(r1.error).to.be.undefined;

      let r2 = await bucket.image(common_bucket_domains[0]);
      debug('设置Bucket镜像源并返回：%s', JSON.stringify(r2));
      expect(r2).to.be.an('object');
      expect(r2.error).to.be.undefined;

      // 使用prefetch同步镜像文件
      let r3 = await qiniu.file(newBucketName + ':' + common.fileName).prefetch();
      debug('镜像资源更新并返回：%s', JSON.stringify(r3));
      expect(r3).to.be.an('object');
      expect(r3.error).to.be.undefined;

      let r4 = await bucket.drop();
      debug('删除Bucket并返回：%s', JSON.stringify(r4));
      expect(r4).to.be.an('object');
      expect(r4.error).to.be.undefined;
    } catch (error) {
      if (error.statusCode === 478) {
        console.log('statusCode=478，镜像回源失败，主要指镜像源服务器出现异常。可以无视这个错误');
      } else {
        return Promise.reject(error);
      }
    }
  });
  it('delete 删除接口', async function () {
    let result = await qiniu.file(common.scope).delete();
    debug('删除文件并返回：%s', JSON.stringify(result));
  });
  after(async function () {
    let result = await qiniu.bucket(common.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    let result2 = await qiniu.bucket(common.bucketName_2).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result2));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
});