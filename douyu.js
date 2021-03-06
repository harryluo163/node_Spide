/**
 * Created by Harry on 2017/5/11.
 */
var request = require("request");
//文档分析
var cheerio = require("cheerio");
var fs = require('fs');
//日志
var logger = require("./bin/logHelper").helper;
//流程控制
var async = require("async");
//数据库访问
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
//mongodb访问
var _mongodb = require('./model/mongodb');


function start() {
// 注：配置里的日志目录要先创建，才能加载配置，不然会出异常
    logger.writeInfo("开始记录日志");
    spide('https://www.douyu.com/directory/all');
}

function spide(url) {
    //流程控制
    async.waterfall([
        function(cb){
            //获取总页数，直接get请求
            request('https://www.douyu.com/directory/all', function (error, response, body) {
                //获取总页数
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(body, {
                        normalizeWhitespace: true,
                        decodeEntities: false
                    });
                    var num = $(".classify_li a").eq(0).attr("data-pagecount");
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
                    qs: {page: i, isAjax: 1}
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
                        logger.writeInfo("douyu抓取结束");
                        console.log("douyu抓取结束");
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
        var $ = cheerio.load(body, {
            normalizeWhitespace: true,
            decodeEntities: false
        });
        var items = [];
        var itemsstr = [];
        logger.writeInfo("抓取第" + opt.qs.page+"页");
        $("li").each(function (index, el) {
            var dyNum =$(el).find('.dy-num.fr').text();
            if(dyNum.indexOf('万')>=0){
                dyNum =Number(dyNum.replace('万',''))*10000;
            }
            var item = {
                userid: $(el).find('a.play-list-link').attr("data-rid"),
                userName: $(el).find('.dy-name.ellipsis.fl').text(),
                tag: $(el).find('.tag.ellipsis').text(),
                dyNum: dyNum,
                title:$(el).find('a.play-list-link').attr("title"),
                url:"https://www.douyu.com"+$(el).find('a.play-list-link').attr("href")
            };
            items.push(item);
        });
        // var sql="INSERT INTO [dbo].[douyu]([userid],[userName],[tag],[dyNum] ,[title],[url],[SpideTiem]) VALUES " ;
        // for(var vue of items){
        //     itemsstr.push("('"+vue.userid+"','"+vue.userName+"','"+vue.tag+"','"+vue.dyNum+"','"+vue.title+"','"+vue.url+"',GETDATE())")
        // }
        if(items.length>0) {
            //插入mssql
            // data_db.query(sql+itemsstr.toString()).then(function (q) {
            //     console.log("插入第" + opt.qs.page+"页");
            //     cb();
            // });


            //json格式
            // fs.writeFile('output/output'+opt.qs.page+'.json', JSON.stringify(items, null, 2), function (err) {
            //     console.log("插入第" + opt.qs.page+"页");
            //     cb();
            // });

        //使用mongoDB保存
            // _mongodb.douyuModel.collection.insert(items,function(err){
            //     if(err){
            //         console.log(err);
            //     }else{
            //         console.log("插入第" + opt.qs.page+"页");
            //         cb();
            //     }
            // })
        }


    });
}

exports.start =start;