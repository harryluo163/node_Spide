/**
 * Created by luojian4 on 2017/5/12.
 */

var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://127.0.0.1:27017/UserInfo');//；连接数据库
var Schema = mongoose.Schema;
mongoose.connection.on('connected', function(){
    console.log('Connection success!');
});
mongoose.connection.on('error', function(err){
    console.log('Connection error: ' + err);
});
mongoose.connection.on('disconnected', function(){
    console.log('Connection disconnected');
});
var douyuSchema =new Schema({
    userid:String,
    userName:Number,
    tag:String,
    dyNum:String,
    title:String,
    url:String,
    SpideTiem:{type: Date, default: Date.now},

})

var huyaSchema =new Schema({
    // userid:String,
    // userName:Number,
    // tag:String,
    // dyNum:String,
    // title:String,
    // title2:String,
    // url:String,
    // SpideTiem:{type: Date, default: Date.now},

})
//不设置自动
var pandaSchema =new Schema()
var quanminSchema =new Schema()
var longzhuSchema =new Schema()
//  定义了一个新的模型，但是此模式还未和users集合有关联
exports.douyuModel = db.model('douyu', douyuSchema,'douyu'); //  与douyu集合关联
exports.huyaModel = db.model('huya', huyaSchema,'huya'); //  与huya集合关联
exports.pandaModel = db.model('panda', pandaSchema,'panda'); //  与panda集合关联
exports.quanminModel = db.model('quanmin', quanminSchema,'quanmin'); //  与quanmin集合关联
exports.longzhuModel = db.model('longzhu', longzhuSchema,'longzhu'); //  与quanmin集合关联
// db.model('douyu', douyuSchema); //  与douyu集合关联
// db.model('huya', huyaSchema); //  与douyu集合关联