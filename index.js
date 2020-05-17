'use strict';
const http = require('http');
const exec = require('child_process').exec;
const os=require('os');
const system = os.platform();


function func(){}
func.prototype = {
    execute:function(cmd,callback){
        exec(cmd, function(error, stdout, stderr) {
            if(error){
                console.log(cmd+ ' fail');
                if(callback && typeof callback === 'function') {
                    console.log(error);
                    callback(false);
                }
            } else{
                console.log(cmd+ ' success');
                if(callback && typeof callback === 'function') {
                    callback(true);
                }
            }
        });
        return this;
    }
};
function run() { return new func(); }

let init = function(option){
    http.createServer(function(req, res){
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Foo', 'bar');
        console.log(req.method);
        console.log(req.url);
        if(req.headers['x-gitee-token']===option.acceptToken && req.method===option.method && req.url === option.url && req.headers['user-agent']==='git-oschina-hook') {
            // 验证成功
            let loop = function loop(i){
                run().execute(option.cmd[i],(success)=>{
                    if(i<option.cmd.length-1) {
                        if(success===true) {
                            i++;
                            loop(i);
                        } else {
                            console.log('fail');
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('fail');
                            return false;
                        }
                    } else {
                        console.log('success');
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('success');
                    }
                });
            };
            loop(0);

        } else {
            res.writeHead(402, { 'Content-Type': 'text/plain' });
            res.end('fail');
        }

    }).listen(option.port);
    console.log('自动部署服务启动于：' + system + '操作系统，端口号：' + option.port);
};

module.exports = init;