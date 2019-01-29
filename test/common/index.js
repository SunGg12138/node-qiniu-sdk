// 测试使用的公共函数

const fs = require('fs');
const path = require('path');
const debug = require('debug')('test');
const rp = require('node-request-slim').promise;

// 检查是否已经配置好了qiniu.config文件
exports.beforeTest = function(){
  try {
    require('../resource/qiniu.config');
  } catch (error) {
    throw new Error(`
    先配置你的/test/resource/qiniu.config.json文件再测试
    qiniu.config.json是放置AccessKey和SecretKey的配置文件
    1. 配置你的AccessKey和SecretKey到/test/resource/qiniu.config.default.json 
    2. qiniu.config.default.json 改名为qiniu.config.json
    `);
  }
};

// 资源基本远程url
const resource_base_url = exports.resource_base_url = 'https://raw.githubusercontent.com/SunGg12138/node-qiniu-sdk-resource/master/';
// 资源基本本地path
const resource_base_path = exports.resource_base_path = path.join(__dirname, '../resource/');

// 测试文件检测
exports.testFile = async function(filename){
  // 判断本地是否已经存在
  let isExists = fs.existsSync(resource_base_path + filename);
  if (isExists) return;

  debug('正在下载：' + filename);
  // 本地不存在去远程获取
  await rp({ url: resource_base_url + filename, pipe: fs.createWriteStream(resource_base_path + filename) });
}