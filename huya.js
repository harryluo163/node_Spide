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
    spide('http://www.huya.com/cache.php');
}

function spide(url) {
    async.waterfall([
        function(cb){
            request('http://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&tagAll=0', function (error, response, body) {
                //获取总页数

                    var bodyobj=JSON.parse(body);
                    if(bodyobj.status=="200"){
                        cb(null,bodyobj.data.totalPage);
                    }



            })
        },
        function(num,cb){
            var opts = [];
            for (var i = 1; i <num; i++) {
                opts.push({
                    method: 'GET',
                    url: url,
                    qs:{page:i,tagAll:0,do:'getLiveListByPage',m:'LiveList'}
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
                        console.log("huya抓取结束");
                        cb();
                    }
                }
            );
        }
    ]);



}

function fetchPage(opt, cb) {
    console.log("抓取第" + opt.qs.page+"页");
    request(opt, function (error, response, body) {
        if (error) {
            return;
        }
        var bodyobj=JSON.parse(body);
        if(bodyobj.status=="200") {

            var itemsstr = [];
            logger.writeInfo("抓取第" + opt.qs.page + "页");
            // var reg=new RegExp(",","g");
            // var reg2=new RegExp("'","g");
            // var sql = "INSERT INTO [dbo].[huya]([userid],[userName],[tag],[dyNum],[title],[title2],[url],[SpideTiem]) VALUES ";
            // for (var vue of bodyobj.data.datas) {
            //     itemsstr.push("('" + vue.uid + "','" + vue.nick.replace(reg," ").replace(reg2," ") + "','" + vue.gameFullName.replace(reg," ").replace(reg2," ") + "','" + vue.totalCount.replace(reg," ").replace(reg2," ") + "','" + vue.roomName.replace(reg," ").replace(reg2," ") + "','" + vue.introduction.replace(reg," ").replace(reg2," ") + "','http://www.huya.com/"+vue.privateHost+"',GETDATE())")
            // }
            if (bodyobj.data.datas.length > 0) {
                // //插入mssql
                // data_db.query(sql + itemsstr.toString()).then(function (q) {
                //     console.log("插入第" + opt.qs.page + "页");
                //     cb();
                // });

                _mongodb.huyaModel.collection.insert(bodyobj.data.datas,function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("插入第" + opt.qs.page+"页");
                        cb();
                    }
                })
            }
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