"use strict";

var WechatAPI       = require('wechat-api');
// let appid           = 'wx5491e5203286430c';
// let appsecret       = '4b58993541eeafdd8c236d15bfb15609';

let appid           = 'wx6c564b7d9a75b704';
let appsecret       = 'f9194088144590f294c87c553b8cd788';

var api             = new WechatAPI(appid, appsecret);
var openid          = 'oZqswwUdZbVJgDonYNSGQf-UFTxI'

api.getUser(openid, function (err, data, res){
    console.log(err,data,res)
});
