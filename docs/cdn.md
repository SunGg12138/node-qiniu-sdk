## cdn 融合cdn操作

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
  _type: 'statuscode', domains: [ '****.com', '****.cn' ], freq: '5min', startDate: '2018-05-13', endDate: '2018-05-14'
});
await qiniu.cdn.loganalyze({
  _type: 'hitmiss', domains: [ '****.com', '****.cn' ], freq: '5min', startDate: '2018-05-13', endDate: '2018-05-14'
});

// 缓存刷新
// 官方文档：https://developer.qiniu.com/fusion/api/1229/cache-refresh#3
await qiniu.cdn.refresh({ urls: ['<url1>', '<url2>'], dirs: ['<url1>', '<url2>'] });

// 刷新查询
// 官方文档：https://developer.qiniu.com/fusion/api/1229/cache-refresh#4
await qiniu.cdn.refreshList({ urls: [] });

// 预取
// 官方文档：https://developer.qiniu.com/fusion/api/1227/file-prefetching#3
await qiniu.cdn.prefetch({urls: ['<url1>', '<url2>']});

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

## CDN 使用详情

### cdn.log(day, domains) 日志下载

[官方文档](https://developer.qiniu.com/fusion/api/1226/download-the-log)

有2个参数：
  - day: String类型，日期，例如 2016-07-01
  - domains: Array类型，域名列表

day和domains都是必选的

```javascript

// 获取2018-05-14这天，这两个域名的日志
await qiniu.cdn.log('2018-05-14', [ '****.com', '****.cn' ]);
```

### cdn.loganalyze(options) 日志分析

[官方文档](https://developer.qiniu.com/fusion/api/4081/cdn-log-analysis)

options对象 有6个参数属性：
  - _type: 日志分析类型，有statuscode、hitmiss、reqcount、ispreqcount、topcountip、toptrafficip、topcounturl、toptrafficurl、pageview、uniquevisitor这几种类型
  - domains: 域名列表，总数不超过100条
  - freq: 粒度，可选项为 5min、1hour、1day
  - startDate: 开始时间，起止最大间隔为31天，例如：2018-05-12
  - endDate: 结束时间，起止最大间隔为31天，例如：2018-05-12
  - region: 区域

domains、freq、startDate、endDate、region这几个参数可以根据选择的类型来填写

```javascript
// 这里我选择statuscode类型，statuscode类型需要domains、freq、startDate、endDate这几个参数
await qiniu.cdn.loganalyze({
  _type: 'statuscode', domains: [ '****.com', '****.cn' ], freq: '5min', startDate: '2018-05-13', endDate: '2018-05-14'
});
// 这里我选择hitmiss类型，hitmiss类型需要domains、freq、startDate、endDate这几个参数
await qiniu.cdn.loganalyze({
  _type: 'hitmiss', domains: [ '****.com', '****.cn' ], freq: '5min', startDate: '2018-05-13', endDate: '2018-05-14'
});
```

### cdn.refresh(options) 缓存刷新

[官方文档](https://developer.qiniu.com/fusion/api/1229/cache-refresh#3)

options对象有2个参数属性：：
  - urls: Array类型，要刷新的单个url列表
  - dirs: Array类型，要刷新的目录dir列表

```javascript

// 缓存刷新
await qiniu.cdn.refreshList({ urls: [] });
```

### cdn.refreshList(options) 刷新查询

[官方文档](https://developer.qiniu.com/fusion/api/1229/cache-refresh#4)

options对象有6个参数属性：
  - requestId: string	指定要查询记录所在的刷新请求id
  - isDir: string	指定是否查询目录，取值为 yes/no
  - urls: string	要查询的url列表，每个url可以是文件url，也可以是目录url
  - state: string	指定要查询记录的状态，取值processing／success／failure
  - pageNo: int	要求返回的页号，默认为0
  - pageSize: int	要求返回的页长度，默认为100

```javascript

// 刷新查询
await qiniu.cdn.refreshList({ urls: ['<url1>', '<url2>'], dirs: ['<url1>', '<url2>'] });
```

### cdn.prefetch(options) 预取

[官方文档](https://developer.qiniu.com/fusion/api/1227/file-prefetching#3)

options对象有1个参数属性：
  - urls: string	要预取的单个url列表，总数不超过100条

```javascript

// 预取
await qiniu.cdn.prefetch({urls: ['<url1>', '<url2>']});
```

### cdn.prefetchList(options) 预取查询

[官方文档](https://developer.qiniu.com/fusion/api/1227/file-prefetching#4)

options对象有1个参数属性：
  - requestId: string	指定要查询记录所在的刷新请求id
  - urls: string	要查询的url列表，每个url可以是文件url，也可以是目录url
  - state: string	指定要查询记录的状态，取值processing／success／failure
  - pageNo: int	要求返回的页号，默认为0
  - pageSize: int	要求返回的页长度，默认为100

```javascript

// 预取查询
await qiniu.cdn.prefetchList({ urls: [] });
```

### cdn.bandwidth(options) 批量查询 cdn 带宽

[官方文档](https://developer.qiniu.com/fusion/api/1230/traffic-bandwidth#3)

options对象有4个参数属性：
 - startDate	string	必须	开始日期，例如：2016-07-01
 - endDate	string	必须	结束日期，例如：2016-07-03
 - granularity	string	必须	粒度，取值：5min ／ hour ／day
 - domains	string	必须	域名列表，以 ；分割

```javascript

// 批量查询 cdn 带宽
await qiniu.cdn.bandwidth({startDate: '2018-05-10', endDate: '2018-05-15', granularity: '5min', domains: []});
```

### cdn.flux(options) 批量查询 cdn 流量

[官方文档](https://developer.qiniu.com/fusion/api/1230/traffic-bandwidth#3)

options对象有4个参数属性：
 - startDate	string	必须	开始日期，例如：2016-07-01
 - endDate	string	必须	结束日期，例如：2016-07-03
 - granularity	string	必须	粒度，取值：5min ／ hour ／day
 - domains	string	必须	域名列表，以 ；分割

```javascript

// 批量查询 cdn 流量
await qiniu.cdn.flux({startDate: '2018-05-10', endDate: '2018-05-15', granularity: '5min', domains: []});
```