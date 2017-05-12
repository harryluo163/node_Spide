/**
 * Created by Harry on 2017/5/11.
 */
var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs');
var logger = require("./bin/logHelper").helper;
var async = require("async");
var Sequelize = require('sequelize');
var data_db= new Sequelize(
    "UserInfo",
    "sa",
    "pass1234",{
        dialect:'mssql',
        host:'127.0.0.1',
        port:1433
    }
);
var _mongodb = require('./model/mongodb');

function start() {
// 注：配置里的日志目录要先创建，才能加载配置，不然会出异常
    logger.writeInfo("开始记录日志");
    spide('http://www.panda.tv/live_lists');
}

function spide(url) {
    async.waterfall([
        function(cb){
            request('http://www.panda.tv/live_lists?status=2&order=person_num&pageno=999&pagenum=120', function (error, response, body) {
                //获取总页数
                var bodyobj=JSON.parse(body);
                if(bodyobj.errno=="0"){
                    var total =bodyobj.data.total;
                    var num = parseInt(Number(total)/120) ;
                    cb(null,num);
                }
            })
        },
        function(num,cb){
            var opts = [];
            for (var i = 1; i <num; i++) {
                opts.push({
                    method: 'GET',
                    url: url,
                    qs:{status:2,order:'person_num',pageno:i,pagenum:120}
                });
            }
            //2秒抓一次
            // async.eachSeries(opts,function (opt, callback) {
            //     setTimeout(function(){
            //         fetchPage(opt, (err) => {callback()});
            //       }, 2000);
            //     }
            // );
            //控制最大并发数为5，
            async.forEachLimit(opts,5,function (opt, callback) {
                    setTimeout(function(){
                        fetchPage(opt, (err) => {callback()});
                    }, 2000);
                },function (err) {
                    if (err) {
                        logger.writeErr(err);
                        cb(err);
                    } else {
                        logger.writeInfo("抓取结束");
                        cb();
                    }
                }
            );
        }
    ]);



}
function fetchPage(opt, cb) {
    console.log("抓取第" + opt.qs.pageno+"页");
    request(opt, function (error, response, body) {
        if (error) {
            return;
        }
        var bodyobj=JSON.parse(body);
        if(bodyobj.errno=="0"){
            var itemsstr = [];
            logger.writeInfo("抓取第" + opt.qs.pageno + "页");
            if (bodyobj.data.items.length > 0) {
                _mongodb.huyaModel.collection.insert(bodyobj.data.items,function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("插入第" + opt.qs.pageno+"页");
                        cb();
                    }
                })
            }
        }else{
            cb(error);
        }


    });
}
function getCharFromUtf8(str) {
    var cstr = "";
    var nOffset = 0;
    if (str == "")
        return "";
    str = str.toLowerCase();
    nOffset = str.indexOf("%e");
    if (nOffset == -1)
        return str;
    while (nOffset != -1) {
        cstr += str.substr(0, nOffset);
        str = str.substr(nOffset, str.length - nOffset);
        if (str == "" || str.length < 9)
            return cstr;
        cstr += utf8ToChar(str.substr(0, 9));
        str = str.substr(9, str.length - 9);
        nOffset = str.indexOf("%e");
    }
    return cstr + str;
}
function utf8ToChar(str) {
    var iCode, iCode1, iCode2;
    iCode = parseInt("0x" + str.substr(1, 2));
    iCode1 = parseInt("0x" + str.substr(4, 2));
    iCode2 = parseInt("0x" + str.substr(7, 2));
    return String.fromCharCode(((iCode & 0x0F) << 12) | ((iCode1 & 0x3F) << 6) | (iCode2 & 0x3F));
}
exports.start =start;