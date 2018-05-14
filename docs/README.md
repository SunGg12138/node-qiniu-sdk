## 简单介绍

模块分为多个部分，目前是：
1. [bucket](./bucket.md)（存储空间的操作）
2. [file](./file.md) (文件操作)
3. [sdk对象下的接口](./sdk.md)，例如：获取储存空间列表、异步第三方资源抓取、文件批量操作

## 同步官方接口预览

[同步官方接口预览链接](https://developer.qiniu.com/kodo/api/1731/api-overview)

官方接口            | 在这里的接口           | 说明 
-------------------|----------------------|----------------------------------
buckets	           | sdk.buckets          | 列举一个账号的所有空间
mkbucketv2	       | bucket.mk            | 创建存储空间，同时绑定一个七牛二级域名，用于访问资源
domain/list	       | bucket.domain        | 获取一个空间绑定的域名列表
drop	             | bucket.drop          | 删除指定存储空间
upload   	         | file.upload          | 用于在一次 HTTP 会话中上传单一的一个文件
mkblk   	         | file.mkblk           | 为后续分片上传创建一个新的块，同时上传第一片数据
bput	             | 接口测试中             | 上传指定块的一片数据，具体数据量可根据现场环境调整，同一块的每片数据必须串行上传
mkfile	           | file.mkfile          | 将上传好的所有数据块按指定顺序合并成一个资源文件
stat     	         | file.stat            | 仅获取资源的 Metadata 信息，不返回资源内容
chgm    	         | file.chgm            | 修改文件的 MIME 类型信息
move    	         | file.move            | 将源空间的指定资源移动到目标空间，或在同一空间内对资源重命名
copy    	         | file.copy            | 将指定资源复制为新命名资源
delete   	         | file.delete          | 删除指定资源
list    	         | bucket.list          | 用于列举指定空间里的所有文件条目
fetch    	         | file.fetch           | 从指定 URL 抓取资源，并将该资源存储到指定空间中。每次只抓取一个文件，抓取时可以指定保存空间名和最终资源名
batch   	         | sdk.batch            | 指在单一请求中执行多次获取元信息、移动、复制、删除操作，极大提高资源管理效率
prefetch	         | file.prefetch        | 对于设置了镜像存储的空间，从镜像源站抓取指定名称的资源并存储到该空间中
image   	         | bucket.image         | 为存储空间指定一个镜像回源网址，用于取回资源
deleteAfterDays	   | file.deleteAfterDays | 设置指定资源的生命周期，即设置一个文件多少天后删除
chtype  	         | file.chtype          | 修改文件的存储类型信息，即低频存储和标准存储的互相转换

## 官方接口预览未更新的接口

官方接口            | 在这里的接口           | 说明 
-------------------|----------------------|----------------------------------
sisyphus           | sdk.sisyphus         | 从指定 URL 抓取资源，并将该资源存储到指定空间中。这是异步的，可以一次抓取多个文件
private            | bucket.private       | 设置 Bucket 访问权限，目前 Bucket 有两种访问权限：公开和私有

## 封装接口

接口                           | 说明 
------------------------------|----------------------------------
file.sliceUpload              | 封装了创建块、创建文件2个接口来分片上传文件