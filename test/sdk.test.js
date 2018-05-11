const qiniu = require('../index');
const qiniu_config = require('./qiniu.config');
var sdk = new qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

// sdk.buckets()
// .then(console.log, console.log);

// sdk.sisyphus({
//   body: {
//     url: 'http://p0vquqra2.bkt.clouddn.com/24993290_658467184540793_2921387702181767499_n.jpg;http://p0vquqra2.bkt.clouddn.com/test.jpg',
//     bucket: 'target'
//   }
// })
// .then(console.log, console.log);

sdk.batch({
  ops: [
    {
      _type: 'move',
      bucket: 'study',
      fileName: 'test.png',
      dest: 'test-1.png',
      force: false
    },
    {
      _type: 'copy',
      bucket: 'study',
      fileName: 'test2.png',
      dest: 'test-2.png',
      force: false
    },
    {
      _type: 'chtype',
      bucket: 'study',
      fileName: 'test3.png',
      type: 1
    },
    {
      _type: 'stat',
      bucket: 'study',
      fileName: 'test12138.png',
    },
    {
      _type: 'delete',
      bucket: 'study',
      fileName: 'games.data.js',
    }
  ]
})
.then(console.log, console.log);