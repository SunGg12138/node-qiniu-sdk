const _ = require('lodash');
const qs = require('querystring');

module.exports = Statistic;

/**
 * 对象储存-数据统计接口
 */
function Statistic(sdk){
  this.sdk = sdk;
}

/**
 * 该接口可以获取标准存储的当前存储量。监控统计可能会延迟 1 天。
 * 官方文档：https://developer.qiniu.com/kodo/api/3908/statistic-space
 * @param {String} options.bucket 可选，存储空间名称，是一个条件请求参数
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间粒度，支持 day
 * @param {String} options.region 可选，存储区域
 */
Statistic.prototype.space = function(options){
  if (!options) return Promise.reject('options is required');

  // 挑出指定参数
  options = _.pick(options, [ 'bucket', 'begin', 'end', 'g', 'region' ]);

  let request_options = {
    host: 'http://api.qiniu.com',
    path: '/v6/space?' + qs.stringify(options),
    method: 'GET'
  };

  return this.sdk.rs(request_options);
};

/**
 * 该接口可以获取标准存储的文件数量。监控统计可能会延迟 1 天。
 * 官方文档：https://developer.qiniu.com/kodo/api/3914/count
 * @param {String} options.bucket 可选，存储空间名称，是一个条件请求参数
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间粒度，支持 day
 * @param {String} options.region 可选，存储区域
 */
Statistic.prototype.count = function(options){
  if (!options) return Promise.reject('options is required');

  // 挑出指定参数
  options = _.pick(options, [ 'bucket', 'begin', 'end', 'g', 'region' ]);

  let request_options = {
    host: 'http://api.qiniu.com',
    path: '/v6/count?' + qs.stringify(options),
    method: 'GET'
  };

  return this.sdk.rs(request_options);
};

/**
 * 该接口可以获取低频存储的当前存储量。监控统计延迟大概 1 天。
 * 官方文档：https://developer.qiniu.com/kodo/api/3910/space-line
 * @param {String} options.bucket 可选，存储空间名称，是一个条件请求参数
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间粒度，支持 day
 * @param {String} options.region 可选，存储区域
 * @param {String} options.no_predel 可选，除去低频存储提前删除，剩余的存储量，值为1
 * @param {String} options.only_predel 可选，只显示低频存储提前删除的存储量，值为1
 */
Statistic.prototype.space_line = function(options){
  if (!options) return Promise.reject('options is required');

  // 挑出指定参数
  options = _.pick(options, [ 'bucket', 'begin', 'end', 'g', 'region', 'no_predel', 'only_predel' ]);

  let request_options = {
    host: 'http://api.qiniu.com',
    path: '/v6/space_line?' + qs.stringify(options),
    method: 'GET'
  };

  return this.sdk.rs(request_options);
};

/**
 * 该接口可以获取低频存储的文件数量。监控统计延迟大概 1 天。
 * 官方文档：https://developer.qiniu.com/kodo/api/3915/count-line
 * @param {String} options.bucket 可选，存储空间名称，是一个条件请求参数
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间粒度，支持 day
 * @param {String} options.region 可选，存储区域
 */
Statistic.prototype.count_line = function(options){
  if (!options) return Promise.reject('options is required');

  // 挑出指定参数
  options = _.pick(options, [ 'bucket', 'begin', 'end', 'g', 'region' ]);

  let request_options = {
    host: 'http://api.qiniu.com',
    path: '/v6/count_line?' + qs.stringify(options),
    method: 'GET'
  };

  return this.sdk.rs(request_options);
};

/**
 * 该接口可以获取跨区域同步流量统计数据。监控统计延迟大概 5 分钟。
 * 官方文档：https://developer.qiniu.com/kodo/api/blob-transfer
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间聚合粒度(5min hour day month)
 * @param {String} options.select 必选，值为size，表示存储量 (Byte)
 * @param {String} options.$is_oversea 可选，是否为海外同步
 * @param {String} options.$taskid 可选，任务 id
 */
Statistic.prototype.blob_transfer = function(options){
  if (!options) return Promise.reject('options is required');

  // 挑出指定参数
  options = _.pick(options, [ 'begin', 'end', 'g', 'select', '$is_oversea', '$taskid' ]);

  let request_options = {
    host: 'http://api.qiniu.com',
    path: '/v6/blob_transfer?' + qs.stringify(options),
    method: 'GET'
  };

  return this.sdk.rs(request_options);
};

/**
 * 该接口可以获取存储类型转换请求次数。监控统计延迟大概 5 分钟。
 * 官方文档：https://developer.qiniu.com/kodo/api/3913/rs-chtype
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间聚合粒度(5min hour day month)
 * @param {String} options.select 必选，值为hits，表示请求数
 * @param {String} options.$bucket 可选，空间名称
 * @param {String} options.$region 可选，存储区域
 */
Statistic.prototype.rs_chtype = function(options){
  if (!options) return Promise.reject('options is required');

  // 挑出指定参数
  options = _.pick(options, [ 'begin', 'end', 'g', 'select', '$bucket', '$region' ]);

  let request_options = {
    host: 'http://api.qiniu.com',
    path: '/v6/rs_chtype?' + qs.stringify(options),
    method: 'GET'
  };

  return this.sdk.rs(request_options);
};

/**
 * 该接口可以获取存储类型转换请求次数。监控统计延迟大概 5 分钟。
 * 官方文档：https://developer.qiniu.com/kodo/api/3913/rs-chtype
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间聚合粒度(5min hour day month)
 * @param {String} options.select 必选，flow 外网流出流量 (Byte)，hits GET 请求次数
 * @param {String} options.$src 必选，流量来源，origin 通过外网访问，inner 通过内网访问，当 select 值为flow时， 取值origin；当 select 值为hits时， 取值origin和inner
 * @param {String} options.$bucket 可选，空间名称
 * @param {String} options.$domain 可选，空间访问域名
 * @param {String} options.$ftype 可选，存储类型
 * @param {String} options.$region 可选，存储区域
 */
Statistic.prototype.blob_io = function(options){
  if (!options) return Promise.reject('options is required');

  // 挑出指定参数
  options = _.pick(options, [ 'begin', 'end', 'g', 'select', '$src', '$bucket', '$domain', '$ftype', '$region' ]);

  let request_options = {
    host: 'http://api.qiniu.com',
    path: '/v6/blob_io?' + qs.stringify(options),
    method: 'GET'
  };

  return this.sdk.rs(request_options);
};

/**
 * 该接口可以获取 PUT 请求次数。监控统计延迟大概 5 分钟。
 * 官方文档：https://developer.qiniu.com/kodo/api/3912/rs-put
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间聚合粒度(5min hour day month)
 * @param {String} options.select 必选，flow 外网流出流量 (Byte)，hits GET 请求次数
 * @param {String} options.$bucket 可选，空间名称
 * @param {String} options.$ftype 可选，存储类型
 * @param {String} options.$region 可选，存储区域
 */
Statistic.prototype.rs_put = function(options){
  if (!options) return Promise.reject('options is required');

  // 挑出指定参数
  options = _.pick(options, [ 'begin', 'end', 'g', 'select', '$bucket', '$ftype', '$region' ]);

  let request_options = {
    host: 'http://api.qiniu.com',
    path: '/v6/rs_put?' + qs.stringify(options),
    method: 'GET'
  };

  return this.sdk.rs(request_options);
};