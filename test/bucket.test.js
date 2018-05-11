const qiniu = require('../index');
const qiniu_config = require('./qiniu.config');
var sdk = new qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

// sdk.bucket('xx')
// .mk()
// .then(console.log, console.log);

// sdk.bucket('xx')
// .image('http://p0vquqra2.bkt.clouddn.com')
// .then(console.log, console.log);

// sdk.bucket('xx')
// .private(1)
// .then(console.log, console.log);

// sdk.bucket('xx')
// .domain()
// .then(console.log, console.log);

// sdk.bucket('study')
// .list({ limit: 100 })
// .then(console.log, console.log);

// sdk.bucket('xx')
// .drop()
// .then(console.log, console.log);