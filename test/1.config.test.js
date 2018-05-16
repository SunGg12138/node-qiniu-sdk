try {
  const qiniu_config = require('./resource/qiniu.config');
} catch (error) {
  throw new Error(`
  先配置你的/test/resource/qiniu.config.json文件再测试
  qiniu.config.json是放置AccessKey和SecretKey的配置文件
  格式与qiniu.config.default.json相同，你需要配置你的qiniu.config.json
  `);
}
const qiniu_config = require('./resource/qiniu.config');
const expect = require('chai').expect;
const Qiniu = require('../index');
let qiniu = null;

describe('测试环境', function(){
  it('qiniu.config.json', function(){
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