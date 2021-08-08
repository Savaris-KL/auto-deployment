"use strict";
const http = require("http");
const exec = require("child_process").exec;
const execFile = require("child_process").execFile;
const os = require("os");
const iconv = require("iconv-lite");
const buffer = require("buffer");
const system = os.platform();
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");

let binaryEncoding = "binary";
let encoding = "cp936";
let options = {
  encoding: binaryEncoding,
  windowsHide: false,
};
function func() {}
func.prototype = {
  execute: function (cmd, callback) {
    exec(cmd, options, function (error, stdout, stderr) {
      if (error) {
        console.log(cmd + " fail");
        if (callback && typeof callback === "function") {
          let result = iconv.decode(
            Buffer.from(stderr, binaryEncoding),
            encoding
          );
          callback(true, result);
        }
      } else {
        console.log(cmd + " success");
        if (callback && typeof callback === "function") {
          console.log("cmd:" + cmd);
          let result = iconv.decode(
            Buffer.from(stdout, binaryEncoding),
            encoding
          );
          callback(true, result);
        }
      }
    });
    return this;
  },
};
function run() {
  return new func();
}

let init = function (option) {
  http
    .createServer(function (req, res) {
      console.log(req.method + ":" + req.url);
      if (
        req.headers["x-coding-signature"] && // TODO 暂时不处理，能触发就行了
        req.headers["user-agent"] === "Coding.net Hook" &&
        req.method === option.method &&
        req.url === option.url
      ) {
        // 验证成功
        // 判断执行类型 file or command 默认：command
        console.log("async:" + option.async);
        if (option.type !== "file") {
          let resText = "";
          let loop = function loop(i) {
            run().execute(option.cmd[i], (success, result) => {
              resText += result;
              if (i < option.cmd.length - 1) {
                if (success === true) {
                  i++;
                  loop(i);
                } else {
                  if (option.async === false) {
                    console.log("fail");
                    res.writeHead(500, {
                      "Content-Type": "text/plain;charset=UTF-8",
                    });
                    res.end(resText);
                  }
                  return false;
                }
              } else {
                if (option.async === false) {
                  console.log("All success");
                  res.writeHead(200, {
                    "Content-Type": "text/plain;charset=UTF-8",
                  });
                  res.end(resText);
                  return false;
                }
              }
            });
          };
          if (option.async === true) {
            res.writeHead(200, {
              "Content-Type": "text/plain;charset=UTF-8",
            });
            res.end("async success");
            loop(0);
          } else {
            loop(0);
          }
        } else {
          let bash = option.executeFile;
          if (option.async === true) {
            execFile(bash);
            res.writeHead(200, {
              "Content-Type": "text/plain;charset=UTF-8",
            });
            res.end("async success");
          } else {
            execFile(bash, options, (err, stdout, stderr) => {
              if (!stderr) {
                console.log("All success");
                res.writeHead(200, {
                  "Content-Type": "text/plain;charset=UTF-8",
                });
                let result = iconv.decode(
                  Buffer.from(stdout, binaryEncoding),
                  encoding
                );
                res.end(result);
              } else {
                console.log("fail");
                res.writeHead(500, {
                  "Content-Type": "text/plain;charset=UTF-8",
                });
                let result = iconv.decode(
                  Buffer.from(stderr, binaryEncoding),
                  encoding
                );
                res.end(result);
              }
              return false;
            });
          }
        }
      } else {
        res.writeHead(402, { "Content-Type": "text/plain" });
        res.end("fail");
      }
    })
    .listen(option.port);
  console.log(
    "自动部署服务启动于：" + system + "操作系统，端口号：" + option.port
  );
};

module.exports = init;
