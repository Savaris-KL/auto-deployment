const deployment = require("./index.js");
deployment({
  port: 7777,
  method: "POST",
  url: "/webhook/website",
  acceptToken: "myToken",
  userAgnet: "Coding.net Hook",
  type: "command", // file,command,
  async: true, // 异步/同步执行，异步执行不再检测命令是否执行成功
  executeFile: __dirname + "/bash/bash.bat", // Must full path
  cmd: ["ping baidu.com"],
});
