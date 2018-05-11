const expect = require('chai').expect;
const debug = require('debug')('test');
const Qiniu = require('../index');
const qiniu_config = require('./resource/qiniu.config');
const qiniu = new Qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

const common = {
  bucketName: null,
  fileName: 'f.js',
  scope: null
};
describe('File 相关方法测试', function(){
  this.timeout(20000);
  before(function(done){
    // 随机个名字
    common.bucketName = new Date().getTime() + '';
    common.scope = common.bucketName + ':' + common.fileName;

    qiniu.bucket(common.bucketName)
    .mk()
    .then(function(result){
      debug('创建bucket：%s并返回：%s', common.bucketName, JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('upload 直传接口', function(done){
    qiniu.file(common.scope)
    .upload(__filename)
    .then(function(result){
      debug('上传文件并在储存空间的名字为：%s并返回：%s', common.fileName, JSON.stringify(result));
      expect(result).to.be.an('object');
      done();
    })
    .catch(console.error);
  });
  it('copy 资源复制', function(done){
    qiniu.file(common.scope)
    .copy('f_copy.js')
    .then(function(result){
      debug('复制文件并在储存空间的名字为：%s并返回：%s', 'f_copy.js', JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('move 资源移动／重命名', function(done){
    qiniu.file(common.bucketName + ':f_copy.js')
    .move('f_copy_move.js')
    .then(function(result){
      debug('资源移动／重命名文件并在储存空间的新名字为：%s并返回：%s', 'f_copy_move.js', JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('chstatus 修改文件状态', function(done){
    qiniu.file(common.scope)
    .chstatus(1)
    .then(function(result){
      debug('修改文件状态并返回：%s', JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('deleteAfterDays 更新文件生命周期', function(done){
    qiniu.file(common.scope)
    .deleteAfterDays(7)
    .then(function(result){
      debug('更新文件生命周期并返回：%s', JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('chtype 修改文件存储类型', function(done){
    qiniu.file(common.scope)
    .chtype(1)
    .then(function(result){
      debug('修改文件存储类型并返回：%s', JSON.stringify(result));
      done();
    })
    .catch(console.error);
  });
  it('stat 资源元信息查询', function(done){
    qiniu.file(common.scope)
    .stat()
    .then(function(result){
      debug('资源元信息查询并返回：%s', JSON.stringify(result));
      expect(result).to.be.an('object');
      done();
    })
    .catch(console.error);
  });
  it('fetch 第三方资源抓取', function(done){
    qiniu.file(common.bucketName + ':fetch.png')
    .fetch('https://www.baidu.com/img/bd_logo1.png?qua=high')
    .then(function(result){
      debug('第三方资源抓取并返回：%s', JSON.stringify(result));
      expect(result).to.be.an('object');
      done();
    })
    .catch(console.error);
  });
  it('delete 删除接口', function(done){
    qiniu.file(common.scope)
    .delete()
    .then(function(result){
      debug('删除文件并返回：%s', JSON.stringify(result));
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