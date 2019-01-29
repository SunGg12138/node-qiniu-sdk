const common = require('./common');
// 检查是否已经配置好了qiniu.config文件
common.beforeTest();

const fs = require('fs');
const expect = require('chai').expect;
const debug = require('debug')('test');
const Qiniu = require('../index');
const qiniu_config = require('./resource/qiniu.config');
const qiniu = new Qiniu(qiniu_config.AccessKey, qiniu_config.SecretKey);

const CONST = {
  bucketName: null,
  fileName: 'image.test.jpg',
  scope: null,
  domain: null,
  url: null
};
describe('image 相关方法测试', function(){
  this.timeout(20000);
  before(async function(){

    // 下载file.image.test.jpg测试文件
    await common.testFile('file.image.test.jpg');

    // 随机个名字
    CONST.bucketName = new Date().getTime() + '';
    CONST.scope = CONST.bucketName + ':' + CONST.fileName;

    // 创建储存空间
    let r1 = await qiniu.bucket(CONST.bucketName).mk();
    debug('创建bucket：%s并返回：%s', CONST.bucketName, JSON.stringify(r1));

    // 获取空间域名
    let r2 = await qiniu.bucket(CONST.bucketName).domain();
    debug('获取空间域名返回：%s', JSON.stringify(r2));
    CONST.domain = 'http://' + r2[0];

    // 上传图片
    let r3 = await qiniu.file(CONST.scope).upload(__dirname + '/resource/file.image.test.jpg');
    debug('上传图片返回：%s', JSON.stringify(r3));
    // 文件路径
    CONST.url = CONST.domain + '/' + CONST.fileName;
  });
  it('imageInfo 图片基本信息', async function(){
    let result = await Qiniu.image.imageInfo(CONST.url)
    debug('imageInfo返回：%s',JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('exif 图片EXIF信息', async function(){
    let result = await Qiniu.image.exif(CONST.url);
    debug('返回：%s',JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('imageAve 图片平均色调', async function(){
    let result = await Qiniu.image.imageAve(CONST.url);
    debug('返回：%s',JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
  it('pulp 图像鉴黄', async function(){
    let result = await Qiniu.image.pulp(CONST.url);
    debug('pulp 图像鉴黄并返回：%s', JSON.stringify(result));
  });
  it('terror 图片鉴暴恐', async function(){
    let result = await Qiniu.image.terror(CONST.url);
    debug('terror 图片鉴暴恐并返回：%s', JSON.stringify(result));
  });
  it('politician 政治人物识别', async function(){
    let result = await Qiniu.image.politician(CONST.url);
    debug('politician 政治人物识别并返回：%s', JSON.stringify(result));
  });
  it('review 图像审核', async function(){
    let result = await Qiniu.image.review({ uri: CONST.url, sdk: qiniu });
    debug('review图像审核并返回：%s', JSON.stringify(result));
  });

  it('faceDetect 人脸检测', async function(){
    let result = await Qiniu.image.faceDetect({ uri: 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg', sdk: qiniu });
    debug('faceDetect人脸检测并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 0).to.be.ok;
  });

  it('faceSim 1:1人脸比对', async function(){
    let result = await Qiniu.image.faceSim({ 
      uris: [
        { uri: 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg' },
        { uri: 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg' }
      ],
      sdk: qiniu
    });
    debug('faceSim 1:1人脸比对并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 0).to.be.ok;
  });

  it('faceGroup 1:N人脸比对 => 新建人像库', async function(){
    // 设置全局face_id
    group_id = Date.now().toString();

    let result = await Qiniu.image.faceGroup({
      op: 'newGroup',
      data: {
        group_id: group_id,
        uris: [
          {
            "uri": 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg',
            "attribute": {
                "id": '1',
                "name": 'Audrey_Hepburn',
                "mode": 'SINGLE',
                "desc": 'Audrey_Hepburn',
                "reject_bad_face": false
            }
         }
        ]
      },
      sdk: qiniu
    });
    debug('faceGroup 1:N人脸比对 => 新建人像库并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.errors[0] === null).to.be.ok;
  });

  it('faceGroup 1:N人脸比对 => 添加人脸', async function(){
    let result = await Qiniu.image.faceGroup({
      op: 'addFace',
      data: {
        group_id: group_id,
        uris: [
          {
            "uri": 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg',
            "attribute": {
                "id": '2',
                "name": 'Audrey_Hepburn2',
                "mode": 'SINGLE',
                "desc": 'Audrey_Hepburn2',
                "reject_bad_face": false
            }
         }
        ]
      },
      sdk: qiniu
    });
    debug('faceGroup 1:N人脸比对 => 添加人脸并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.errors[0] === null).to.be.ok;
  });

  it('faceGroup 1:N人脸比对 => 删除人脸', async function(){
    let result = await Qiniu.image.faceGroup({
      op: 'deleteFace',
      data: {
        group_id: group_id,
        faces: [
          '2'
        ]
      },
      sdk: qiniu
    });
    debug('faceGroup 1:N人脸比对 => 删除人脸并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });

  it('faceGroup 1:N人脸比对 => 显示所有人像库', async function(){
    let result = await Qiniu.image.faceGroup({
      op: 'groupList',
      sdk: qiniu
    });
    debug('faceGroup 1:N人脸比对 => 显示所有人像库并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 0).to.be.ok;
  });

  it('faceGroup 1:N人脸比对 => 显示指定人像库信息', async function(){
    let result = await Qiniu.image.faceGroup({
      op: 'groupInfo',
      data: {
        group_id: group_id
      },
      sdk: qiniu
    });
    debug('faceGroup 1:N人脸比对 => 显示指定人像库信息并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.count).to.be.a('number');
  });

  it('faceGroup 1:N人脸比对 => 显示所有人脸', async function(){
    let result = await Qiniu.image.faceGroup({
      op: 'faceList',
      data: {
        group_id: group_id,
        limit: 10
      },
      sdk: qiniu
    });
    debug('faceGroup 1:N人脸比对 => 显示所有人脸并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 0).to.be.ok;
  });

  it('faceGroup 1:N人脸比对 => 显示指定人脸信息', async function(){
    let result = await Qiniu.image.faceGroup({
      op: 'faceInfo',
      data: {
        group_id: group_id,
        id: '1'
      },
      sdk: qiniu
    });
    debug('faceGroup 1:N人脸比对 => 显示指定人脸信息并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });

  it('faceGroup 1:N人脸比对 => 人脸搜索', async function(){
    let result = await Qiniu.image.faceGroup({
      op: 'search',
      data: {
        uri: 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg',
        params: {
          groups: [
            group_id
          ],
          limit: 5,
          threshold: 0.85,
          use_quality: true,
          mode: "ALL"
        }
      },
      sdk: qiniu
    });
    debug('faceGroup 1:N人脸比对 => 人脸搜索并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 0).to.be.ok;
  });

  it('faceGroup 1:N人脸比对 => 人脸搜索（旧版本）', async function(){
    let result = await Qiniu.image.faceGroup({
      op: '_search',
      data: {
        group_id: group_id,
        uri: 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg'
      },
      sdk: qiniu
    });
    debug('faceGroup 1:N人脸比对 => 人脸搜索（旧版本）并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 0).to.be.ok;
  });

  it('faceGroup 1:N人脸比对 => 删除人像库', async function(){
    let result = await Qiniu.image.faceGroup({
      op: 'removeGroup',
      data: {
        group_id: group_id
      },
      sdk: qiniu
    });
    debug('faceGroup 1:N人脸比对 => 删除人像库并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });

  it('imageGroup 以图搜图 => 新建图像库', async function(){
    // 设置全局group_id
    group_id = Date.now().toString();

    let result = await Qiniu.image.imageGroup({
      op: 'newGroup',
      data: {
        group_id: group_id,
        uris: [
          {
            "uri": 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg',
            "attribute": {
              "id": '1',
              "label": 'test1',
              "desc": '测试图片'
            }
         }
        ]
      },
      sdk: qiniu
    });
    debug('imageGroup 以图搜图 => 新建图像库并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.errors[0] === null).to.be.ok;
  });

  it('imageGroup 以图搜图 => 添加图片', async function(){
    let result = await Qiniu.image.imageGroup({
      op: 'addImage',
      data: {
        group_id: group_id,
        uris: [
          {
            "uri": 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg',
            "attribute": {
              "id": '2',
              "label": 'test2',
              "desc": '测试图片2'
            }
         }
        ]
      },
      sdk: qiniu
    });
    debug('imageGroup 以图搜图 => 添加图片并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.errors[0] === null).to.be.ok;
  });

  it('imageGroup 以图搜图 => 删除图片', async function(){
    let result = await Qiniu.image.imageGroup({
      op: 'deleteImage',
      data: {
        group_id: group_id,
        images: [
          '2'
        ]
      },
      sdk: qiniu
    });
    debug('imageGroup 以图搜图 => 删除图片并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });

  it('imageGroup 以图搜图 => 显示所有图像库', async function(){
    let result = await Qiniu.image.imageGroup({
      op: 'groupList',
      sdk: qiniu
    });
    debug('imageGroup 以图搜图 => 显示所有图像库并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 0).to.be.ok;
  });

  it('imageGroup 以图搜图 => 显示指定图像库信息', async function(){
    let result = await Qiniu.image.imageGroup({
      op: 'groupInfo',
      data: {
        group_id: group_id
      },
      sdk: qiniu
    });
    debug('imageGroup 以图搜图 => 显示指定图像库信息并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.count).to.be.a('number');
  });

  it('imageGroup 以图搜图 => 显示所有图片', async function(){
    let result = await Qiniu.image.imageGroup({
      op: 'imageList',
      data: {
        group_id: group_id,
        limit: 10
      },
      sdk: qiniu
    });
    debug('imageGroup 以图搜图 => 显示所有图片并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 0).to.be.ok;
  });

  it('imageGroup 以图搜图 => 显示指定图片信息', async function(){
    let result = await Qiniu.image.imageGroup({
      op: 'imageInfo',
      data: {
        group_id: group_id,
        id: '1'
      },
      sdk: qiniu
    });
    debug('imageGroup 以图搜图 => 显示指定图片信息并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });

  it('imageGroup 以图搜图 => 图片搜索', async function(){
    let result = await Qiniu.image.imageGroup({
      op: 'search',
      data: {
        uri: 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg',
        params: {
          groups: [
            group_id
          ],
          limit: 5,
          threshold: 0.85
        }
      },
      sdk: qiniu
    });
    debug('imageGroup 以图搜图 => 图片搜索并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 0).to.be.ok;
  });

  it('imageGroup 以图搜图 => 图片搜索（旧版本）', async function(){
    let result = await Qiniu.image.imageGroup({
      op: '_search',
      data: {
        group_id: group_id,
        uri: 'http://oayjpradp.bkt.clouddn.com/Audrey_Hepburn.jpg'
      },
      sdk: qiniu
    });
    debug('imageGroup 以图搜图 => 图片搜索（旧版本）并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 0).to.be.ok;
  });

  it('imageGroup 以图搜图 => 删除图像库', async function(){
    let result = await Qiniu.image.imageGroup({
      op: 'removeGroup',
      data: {
        group_id: group_id
      },
      sdk: qiniu
    });
    debug('imageGroup 以图搜图 => 删除图像库并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });

  it('ocr身份证识别', async function(){
    let result = await Qiniu.image.ocr({
      uri: 'https://raw.githubusercontent.com/SunGg12138/node-qiniu-sdk-resource/master/ocr.jpg',
      sdk: qiniu
    });
    debug('ocr身份证识别并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.code === 0).to.be.ok;
  });

  it('processing 获取图像处理的链接', async function(){
    let result = await Qiniu.image.processing(CONST.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 }
    });
    debug('返回：%s',JSON.stringify(result));
    expect(result).to.be.a('string');
  });
  it('processing 图像处理后保存到本地', async function(){
    let result = await Qiniu.image.processing(CONST.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 },
      path: __dirname + '/resource/processing.test.jpg'
    });
    expect(fs.existsSync(__dirname + '/resource/processing.test.jpg')).to.be.ok;
    debug('返回：%s', JSON.stringify(result));
  });
  it('processing 图像处理后保存到储存空间', async function(){
    let result = await Qiniu.image.processing(CONST.url, {
      imageslim: true,
      imageView: { w: 200, h: 300 },
      imageMogr: { blur: '20x2', rotate: 45 },
      watermark: { image: 'https://odum9helk.qnssl.com/qiniu-logo.png', scale: 0.3 },
      roundPic: { radius: 20 },
      saveas: qiniu.saveas(CONST.bucketName, 'processing.jpg')
    });
    debug('返回：%s',JSON.stringify(result));
    expect(result).to.be.an('object');
  });
  after(async function(){
    let result = await qiniu.bucket(CONST.bucketName).drop();
    debug('删除Bucket并返回：%s', JSON.stringify(result));
    expect(result).to.be.an('object');
    expect(result.error).to.be.undefined;
  });
});