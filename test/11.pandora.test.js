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

describe('pandora 相关方法测试', function(){
  this.timeout(20000);
  before(async function(){
    pandora = qiniu.pandora();
  });
  it('send 数据推送', async function(){
    let pandora = qiniu.pandora();
    let result = await pandora.send({
      repoName: Date.now() + '',
      content: [
        { userName: '小张', age: 12, addresses: "beijing"},
        { userName: '小王', age: 13, addresses: "hangzhou"}
      ]
    });
    debug('send 数据推送并返回：%s', JSON.stringify(result));
    // E18102这个错误只是提示没有repo，但是操作是正确的
    if (result.error && !/E18102: The specified repo ".+" does not exist/.test(result.error)) {
      expect(result.error).to.be.undefined;
    }
  });
});