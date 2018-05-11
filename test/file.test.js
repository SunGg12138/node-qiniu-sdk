const qiniu = require('../index');
const qiniu_config = require('./qiniu.config');
var sdk = new qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

sdk.file('study:c.png')
.upload(__dirname + '/upload_test.jpg')
.then(console.log, console.log)

// sdk.file('study:d.png')
// .move('e.png', true)
// .then(console.log, console.log)

// sdk.file('study:test.jpg')
// .copy('e.jpg')
// .then(console.log, console.log)

// sdk.file('study:e.png')
// .chstatus(0)
// .then(console.log, console.log)

// sdk.file('study:e.png')
// .deleteAfterDays(1)
// .then(console.log, console.log)

// sdk.file('study:e.png')
// .chtype(1)
// .then(console.log, console.log)

// sdk.file('study:e.png')
// .stat()
// .then(console.log, console.log)

// sdk.file('study:e.png')
// .delete()
// .then(console.log, console.log)