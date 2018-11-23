## statistic 数据统计

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 所有的方法都返回promise，这里我就直接用await了

/**
 * 创建可管理的统计对象
 * 官方文档：https://developer.qiniu.com/kodo/api/3906/statistic-interface
*/
let statistic = await qiniu.statistic();

/**
 * 该接口可以获取标准存储的当前存储量。监控统计可能会延迟 1 天。
 * 官方文档：https://developer.qiniu.com/kodo/api/3908/statistic-space
 * @param {String} options.bucket 可选，存储空间名称，是一个条件请求参数
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间粒度，支持 day
 * @param {String} options.region 可选，存储区域
 * @return {Object} { times:[1502985600], datas:[0] } times: Unix 时间戳，单位为秒，datas: 存储量大小，单位为 Byte
 */
let result = await statistic.space({
  begin: '20170818140000',
  end: '20170818151000',
  g: 'day'
});

/**
 * 该接口可以获取标准存储的文件数量。监控统计可能会延迟 1 天。
 * 官方文档：https://developer.qiniu.com/kodo/api/3914/count
 * @param {String} options.bucket 可选，存储空间名称，是一个条件请求参数
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间粒度，支持 day
 * @param {String} options.region 可选，存储区域
 * @return {Object} { times:[1502985600], datas:[0] } times: Unix 时间戳，单位为秒，datas: 文件数量大小，单位为个
 */
let result = await statistic.count({
  begin: '20170818140000',
  end: '20170818151000',
  g: 'day'
});

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
 * @return {Object} { times:[1502985600], datas:[0] } times: Unix 时间戳，单位为秒，datas: 存储量大小，单位为 Byte
 */
let result = await statistic.space_line({
  begin: '20170818140000',
  end: '20170818151000',
  g: 'day',
  only_predel: 1
});

/**
 * 该接口可以获取低频存储的文件数量。监控统计延迟大概 1 天。
 * 官方文档：https://developer.qiniu.com/kodo/api/3915/count-line
 * @param {String} options.bucket 可选，存储空间名称，是一个条件请求参数
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间粒度，支持 day
 * @param {String} options.region 可选，存储区域
 * @return {Object} { times:[1502985600], datas:[0] } times: Unix 时间戳，单位为秒，datas: 文件数量大小，单位为个
 */
let result = await statistic.count_line({
  begin: '20170818140000',
  end: '20170818151000',
  g: 'day'
});

/**
 * 该接口可以获取跨区域同步流量统计数据。监控统计延迟大概 5 分钟。
 * 官方文档：https://developer.qiniu.com/kodo/api/blob-transfer
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间聚合粒度(5min hour day month)
 * @param {String} options.select 必选，值为size，表示存储量 (Byte)
 * @param {String} options.$is_oversea 可选，是否为海外同步
 * @param {String} options.$taskid 可选，任务 id
 * @return {Object} [{"time":"2017-08-01T00:00:00+08:00","values":{"size":0}}] times: 统计时间，size: 跨区域同步流量大小，单位 Byte
 */
let result = await statistic.blob_transfer({
  begin: '20170818140000',
  end: '20170818151000',
  g: 'month',
  select: 'size'
});

/**
 * 该接口可以获取存储类型转换请求次数。监控统计延迟大概 5 分钟。
 * 官方文档：https://developer.qiniu.com/kodo/api/3913/rs-chtype
 * @param {String} options.begin 必选，起始日期字符串，闭区间，例如： 20060102150405
 * @param {String} options.end 必选，结束日期字符串，开区间，例如： 20060102150405
 * @param {String} options.g 必选，时间聚合粒度(5min hour day month)
 * @param {String} options.select 必选，值为hits，表示请求数
 * @param {String} options.$bucket 可选，空间名称
 * @param {String} options.$region 可选，存储区域
 * @return {Object} [{"time":"2017-08-01T00:00:00+08:00","values":{"hits":0}}] times: 统计时间，hits: 存储类型转换请求次数
 */
let result = await statistic.rs_chtype({
  begin: '20170818140000',
  end: '20170818151000',
  g: 'month',
  select: 'hits'
});

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
 * @return {Object} [{"time":"2017-08-01T00:00:00+08:00","values":{"hits":0}}] times: 统计时间，hits: 存储类型转换请求次数
 */
let result = await statistic.blob_io({
  begin: '20170818140000',
  end: '20170818151000',
  g: 'month',
  select: 'hits',
  $src: 'inner'
});

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
 * @return {Object} [{"time":"2017-08-01T00:00:00+08:00","values":{"hits":0}}] times: 统计时间，hits: 存储类型转换请求次数
 */
let result = await statistic.rs_put({
  begin: '20170818140000',
  end: '20170818151000',
  g: 'month',
  select: 'hits'
});
```