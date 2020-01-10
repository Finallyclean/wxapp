"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const request = require("request");
const sha1 = require("sha1");
let app = express();
// Insert metadata
let appId = 'wxf4363f9859dc66e4';             // Insert your appId
let appsecret = 'dab4e3d9d6a590f0eae6ee5f881b496d';         // insert your appsecret
let url = 'https://wxapp12246.azurewebsites.net';               // insert host url, e.g. http://wxapp.azurewebsites.net/
let nonceStr = 'wxapp12246';          // insert any string
// handshake with WeChat server and get signature for wx.config
function getWXConfig(cb) {
    request.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appsecret, (err, res, body) => {
        request.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + JSON.parse(body).access_token + '&type=jsapi', (err, res, body) => {
            let ticket = JSON.parse(body).ticket;
            let o = {
                appId: appId,
                nonceStr: nonceStr,
                timestamp: new Date().getTime() / 1000 + '',
                signature: ''
            };
            o.signature = sha1('jsapi_ticket=' + ticket + '&noncestr=' + o.nonceStr + '&timestamp=' + o.timestamp + '&url=' + url).toString();
            cb(o);
        });
    });
}
app.engine('.html', require('ejs').__express); // set up ejs as view engine
app.set('views', __dirname + '/views'); // set views dir
app.set('view engine', 'html'); // use .html for ejs files
app.use(express.static('public')); // expose assets in /public
app.get('/', function (req, res) {
    getWXConfig(config => {
        // handshake with WeChat server and render index.html with the returned signature
        res.render('index', {
            appId: config.appId,
            timestamp: config.timestamp,
            nonceStr: config.nonceStr,
            signature: config.signature,
        });
    });
});
app.listen(8080);
