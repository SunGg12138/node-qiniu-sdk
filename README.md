# node-qiniu-sdk

使用Promise，方法、参数名称都严格与官方文档同步

qiniu的官方sdk不太符合日常需要，所以有时间自己撸了个模块，你也可去qiniu官方查看[官方SDK](https://github.com/qiniu/nodejs-sdk)

[文档](./docs)

# 安装

```bash
$ npm install node-qiniu-sdk
```

## 先说哪些接口还没实现吧，有时间再实现或大家帮帮忙

有些官网的文档不太友善，认真看

1. 分片上传 [官方文档](https://developer.qiniu.com/kodo/manual/1650/chunked-upload)
2. 批量操作 [官方文档](https://developer.qiniu.com/kodo/api/1250/batch)
3. 资源元信息修改 [官方文档](https://developer.qiniu.com/kodo/api/1250/batch)
4. 批量操作 [官方文档](https://developer.qiniu.com/kodo/api/1252/chgm)
5. 镜像资源更新（已实现，等待测试） [官方文档](https://developer.qiniu.com/kodo/api/1293/prefetch)
6. 数据统计接口 [官方文档](https://developer.qiniu.com/kodo/api/3906/statistic-interface)

## 官方文档快捷方式

- [API概览](https://developer.qiniu.com/kodo/api/1731/api-overview)
- [HTTP Headers](https://developer.qiniu.com/kodo/api/3924/common-request-headers)
- [错误响应](https://developer.qiniu.com/kodo/api/3928/error-responses)
- [数据格式](https://developer.qiniu.com/kodo/api/1276/data-format)
- [HTTP Headers](https://developer.qiniu.com/kodo/api/3924/common-request-headers)