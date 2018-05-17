## CDN 使用预览

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 所有的方法都返回promise，这里我就直接用await了

// CDN.log 日志下载
// 官方文档：https://developer.qiniu.com/fusion/api/1226/download-the-log
await qiniu.cdn.log('2018-05-14', [ '****.com', '****.cn' ]);

// CDN.loganalyze 日志分析
// 官方文档：https://developer.qiniu.com/fusion/api/4081/cdn-log-analysis
await qiniu.cdn.loganalyze({
  _type: 'statuscode', domains, freq: '5min', startDate: '2018-05-13', endDate: '2018-05-14'
});
await qiniu.cdn.loganalyze({
  _type: 'hitmiss', domains, freq: '5min', startDate: '2018-05-13', endDate: '2018-05-14'
});

// 缓存刷新
// 官方文档：https://developer.qiniu.com/fusion/api/1229/cache-refresh#3
await qiniu.cdn.refresh({ urls: [], dirs: [] });

// 刷新查询
// 官方文档：https://developer.qiniu.com/fusion/api/1229/cache-refresh#4
await qiniu.cdn.refreshList({ urls: [], dirs: [] });

// 预取
// 官方文档：https://developer.qiniu.com/fusion/api/1227/file-prefetching#3
await qiniu.cdn.prefetch({});

// 预取查询
// 官方文档：https://developer.qiniu.com/fusion/api/1227/file-prefetching#4
await qiniu.cdn.prefetchList({ urls: [] });

// 批量查询 cdn 带宽
// 官方文档：https://developer.qiniu.com/fusion/api/1230/traffic-bandwidth#3
await qiniu.cdn.bandwidth({startDate: '2018-05-10', endDate: '2018-05-15', granularity: '5min', domains: []});

// 批量查询 cdn 流量
// 官方文档：https://developer.qiniu.com/fusion/api/1230/traffic-bandwidth#4
await qiniu.cdn.flux({startDate: '2018-05-10', endDate: '2018-05-15', granularity: '5min', domains: []});

```