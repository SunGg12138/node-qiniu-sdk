const expect = require('chai').expect;
const Qiniu = require('../index');
const qiniu_config = require('./resource/qiniu.config');

let qiniu = null;
describe('测试环境', function(){
  it('qiniu.config.json', function(){
    const qiniu_config = require('./resource/qiniu.config');
    expect(qiniu_config.AccessKey).to.be.a('string');
    expect(qiniu_config.SecretKey).to.be.a('string');
    qiniu = new Qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);
  });

  it('测试AccessKey、SecretKey是否正确', function(done){
    qiniu.buckets()
    .then(function(result){
      expect(result).to.be.an('array');
      done();
    })
    .catch(console.error);
  });
});