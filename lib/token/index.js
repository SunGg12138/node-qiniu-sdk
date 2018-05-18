const upload = require('./upload');
const access = require('./access');
const download = require('./download');
const saveas = require('./saveas');
const qiniu = require('./qiniu');

module.exports = {
  upload, access, download, qiniu, saveas
};