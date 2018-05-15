## File 使用预览

```javascript
// 引入模块
const Qiniu = require('node-qiniu-sdk');
// 配置你的qiniu
const qiniu = new Qiniu('<Your AccessKey>', '<Your SecretKey>');

// 所有的方法都返回promise，这里我就直接用await了

// 创建可管理的文件对象并设置区域，区域默认是z0
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>').zone('z1');

// 直传文件
// 参数还有很多，只有path参数是必须
// 官方文档：https://developer.qiniu.com/kodo/api/1312/upload
await file.upload({ path: '<本地文件路径>' });

// 资源移动／重命名
// 官方文档：https://developer.qiniu.com/kodo/api/1288/move
// isForce表示是否强制重命名，这个区别是在新名字是否已存在时
await file.move('<新名字>', '<isForce>');

// 资源复制
// 官方文档：https://developer.qiniu.com/kodo/api/1254/copy
// isForce表示是否强制复制，这个区别是在新文件的名字是否已存在时
await file.copy('<新名字>', '<isForce>');

// 修改文件状态，0表示启用；1表示禁用
// 官方文档：https://developer.qiniu.com/kodo/api/4173/modify-the-file-status
await file.chstatus(1);

// 更新文件生命周期，在deleteAfterDays天会被删除，0表示取消生命周期  没有报错，但是控制台无生命周期
// 官方文档：https://developer.qiniu.com/kodo/api/1732/update-file-lifecycle
await file.deleteAfterDays(7);

// 修改文件存储类型，0 表示标准存储；1 表示低频存储
// 官方文档：https://developer.qiniu.com/kodo/api/3710/chtype
await file.chtype(1);

// 资源元信息查询
// 官方文档：https://developer.qiniu.com/kodo/api/1308/stat
await file.stat();

// 资源元信息修改
// 官方文档：https://developer.qiniu.com/kodo/api/1252/chgm
await file.chgm('image/png');

// 第三方资源抓取
// 官方文档：https://developer.qiniu.com/kodo/api/1263/fetch
await file.fetch('https://www.baidu.com/img/bd_logo1.png?qua=high');

// 镜像资源更新
// 官方文档：https://developer.qiniu.com/kodo/api/1293/prefetch
await file.prefetch();

// 删除接口
// 官方文档：https://developer.qiniu.com/kodo/api/1257/delete
await file.delete();

// 分片上传
// 这个是封装的接口，当读取大文件的时候使用
// 官方文档：https://developer.qiniu.com/kodo/manual/1650/chunked-upload
await file.sliceUpload({ path: '<本地文件路径>' });
```

## File 使用详情

### file.zone(zone) 选择和切换区域

有1个参数：
  - zone(必选): String类型，空间及文件的所在区域

目前的区间z0, z1, z2, na0, as0，你可以在zone.js文件[查看详情](../zone.js)

zone方法不会返回promise，会直接返回File对象

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 区域默认是z0，如果你的区域不是z0，需要使用zone切换
file.zone('z1');
```

### file.upload(options) 上传文件或文本

options对象 有4个参数属性：
  - path: String类型，表示上传文件的路径
  - stream: 上传文件的流
  - txt: 需要上传的文本
  - encoding: 编码的种类与Buffer支持的种类相同（默认：'utf8'）

path,stream,txt这三个参数至少要有一个，优先级从左到右，encoding只有txt参数起作用时才会有效
当options不是对象而是字符串时，会把它当做path

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 上传目录下的f.js文件，上传后的名字是qiniu.file设定的<文件名称>
await file.upload({ path: __dirname + '/f.js' });
// 当options不是对象而是字符串时，会把它当做path，与上一步相同
await file.upload(__dirname + '/f.js');

// 使用流上传
await file.upload({ stream: require('request').get('https://www.baidu.com/img/bd_logo1.png?qua=high') });

// 上传文本
await file.upload({ txt: 'var a = 12, b = 13, c = 18;', encoding: 'utf8' });
```

### file.copy(dest[, isForce]) 复制文件

有2个参数：
  - dest(必选): String类型，表示copy后的新文件名字
  - isForce(可选): Boolean类型，表示是否强制copy，如果新文件名字重名，强制copy会覆盖原文件，非强制copy会报错（默认为false）

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 复制出一个新文件并命名为kk.js，并设置强制copy
await file.copy('kk.js', true);
```

### file.move(dest[, isForce]) 资源移动／重命名

有2个参数：
  - dest(必选): String类型，表示move后的新文件名字
  - isForce(可选): Boolean类型，表示是否强制move，如果新文件名字重名，强制move会覆盖原文件，非强制move会报错（默认为false）

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 重命名为kk.js，并设置强制move
await file.move('kk.js', true);
```

### file.chstatus(status) 修改文件状态

有1个参数：
  - status(必选): 0或1，表示修改后的文件状态，0表示启用；1表示禁用

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 设置文件为禁用状态
await file.status(1);
```

### file.deleteAfterDays(deleteAfterDays) 更新文件生命周期

有1个参数：
  - deleteAfterDays(必选): 更新文件生命周期，在deleteAfterDays天会被删除，0表示取消生命周期

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 让文件1天后自动删除
await file.deleteAfterDays(1);
```

### file.chtype(type) 修改文件存储类型

有1个参数：
  - type(必选): 0或1，修改文件存储类型，0 表示标准存储；1 表示低频存储

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 修改文件存储类型为低频存储
await file.chtype(1);
```

### file.stat() 资源元信息查询

没有参数

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 资源元信息查询
await file.stat();
```

### file.chgm(mimetype, metas, conds) 资源元信息修改

有3个参数：
  - mimetype(必选): String类型，修改后文件的资源元信息
  - metas(可选): Array类型，自定义meta_key和metavalue，例如：[ {key: 'h1', value: 'hh'}, {key: 'h2', value: 'hhh'} ]
  - conds(可选): String类型，设置更新条件，例如：hash=xxx&mime=text/plain&fsize=12&putTime=123213213

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 资源元信息修改成text/plain
await file.chgm('text/plain');
```

### file.fetch(url) 第三方资源抓取

有3个参数：
  - mimetype(必选): String类型，修改后文件的资源元信息
  - metas(可选): Array类型，自定义meta_key和metavalue，例如：[ {key: 'h1', value: 'hh'}, {key: 'h2', value: 'hhh'} ]
  - conds(可选): String类型，设置更新条件，例如：hash=xxx&mime=text/plain&fsize=12&putTime=123213213

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 抓取指定url的图片
await file.fetch('http://119.75.213.61/img/bd_logo1.png?qua=high');
```

### file.prefetch() 镜像资源更新

没有参数

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 前提是已经设置了镜像源
await file.prefetch();
```

### file.delete() 删除文件

没有参数

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 删除文件
await file.delete();
```

### file.sliceUpload(options) 分片上传文件

options对象 有2个参数属性：
  - path: String类型，表示上传文件的路径
  - stream: 上传文件的流

path,stream这两个参数至少要有一个，优先级从左到右
当options不是对象而是字符串时，会把它当做path

```javascript
// 创建可管理的文件对象
// 存储空间名称与文件名称中间用 ":" 分隔
const file = qiniu.file('<存储空间名称>:<文件名称>');

// 上传目录下的ll.mp4文件(底层也是使用流上传)
await file.sliceUpload({ path: __dirname + '/ll.mp4' });
// 当options不是对象而是字符串时，会把它当做path，与上一步相同(底层也是使用流上传)
await file.sliceUpload(__dirname + '/ll.mp4');

// 使用流上传
await file.sliceUpload({ stream: fs.createStream(__dirname + '/ll.mp4') });
```