const common = require('./common');
// 检查是否已经配置好了qiniu.config文件
common.beforeTest();

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

  it('测试AccessKey、SecretKey是否正确', async function(){
    let result = await qiniu.buckets();
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('array');
  });
});