const request = require('node-request-slim');
const errors = require('../errors');

module.exports = function(options){
  return new Promise((resolve, reject) => {
    request(options, function(err, res, body){
      // 请求出错
      if (err) return reject(err);
      // 状态码为200，请求成功，状态码为298时为部分成功也算成功
      if (res.statusCode === 200 || res.statusCode === 298) return resolve(body);
      // 返回详细的错误信息
      return reject({ statusCode: res.statusCode, body, errmsg: errors[res.statusCode] });
    });
  });
};