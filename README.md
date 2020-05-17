# auto-deployment
运行与nodejs环境的自动化部署插件，在gitee配置webhook后，push项目即可自动部署至服务器。

[![GitHub stars](https://img.shields.io/github/stars/acccccccb/auto-deployment?style=for-the-badge)](https://github.com/acccccccb/auto-deployment/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/acccccccb/auto-deployment?style=for-the-badge)](https://github.com/acccccccb/auto-deployment/network)
[![npm](https://img.shields.io/npm/v/auto-deployment?style=for-the-badge)](https://www.npmjs.com/package/auto-deployment)
[![npm](https://img.shields.io/npm/dt/auto-deployment?style=for-the-badge)](https://www.npmjs.com/package/auto-deployment)

### 使用说明

#### 首先在要自动部署的服务器上新建一个目录，进目录后执行：
----
```bash
npm init
npm install auto-deployment
```
然后在目录中新建一个js文件写入以下内容

```javascript
const deployment = require('auto-deployment');
deployment({
    port:7777,
    method:'POST',
    url:'/webhook',
    acceptToken:'Your token',
    userAgnet:"git-oschina-hook",
    cmd:[
        'ping baidu.com',
        'git -C f://phpcrm pull',
    ]
});
```
之后运行这个js
```javascript
node yourjs.js
```
如果运行成功，控制台将会打印出成功的结果

#### 然后再去Gitee项目配置里的WebHooks管理添加一个WebHooks

![gitee](https://www.ihtmlcss.com/wp-content/uploads/2020/05/1.png)

设置好后保存，会请求一次，返回200就是配置好了
![gitee](https://www.ihtmlcss.com/wp-content/uploads/2020/05/2.png)


以上必须用ssh登陆服务器并运行yourjs.js才可以实现自动部署，你也可以将此命令加入到开机脚本中，让服务器自动启用服务，实现100%自动部署，如何修修改开机脚本请自行百度。

### 参数说明

----

| 属性名 | 说明 | 类型  | 必填 | 可选值 |
|:----:|----|:----:|:----:|:----:|
|port|端口|Number|是|-
|method|请求方法|string|是|POST/GET
|url|链接|string|是|'/'
|acceptToken|认证|string|是|-
|userAgnet|ua|string|是|-
|cmd|要执行的命令|arr|是|-