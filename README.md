# node_Spide
node.js 爬虫
目前是抓取斗鱼 虎牙 熊猫 全民 龙珠 在线主播，
使用node.js
数据库是 sql server 和mongodb
还有直接保存json格式

使用的是 mongodb 所以需要先安装
安装方法  http://blog.csdn.net/q3585914/article/details/71713679

然后直接 npm install



./bin 日志配置
./logs 日志目录
,/model  mongodb 实体
./output json输出目录
index.js 启动项  node.exe index.js
douyu.js 抓取斗鱼
。。。。 。。。
x

接下来介绍思路：

第一步 分析页面（找到在线直播的url）
第二步 使用require 请求页面 获取html文档
第三步 使用cheerio 分析页面
第四步 保存数据到 json.js 文档 MySQL mongodb

http://blog.csdn.net/q3585914/article/details/72058261

