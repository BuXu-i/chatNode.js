const jwrSecrekey = "xuyang";
module.exports = {
    jwrSecrekey: jwrSecrekey, //密钥
    expresin: "12h",
    // path: [/\/space/, /\/friend\/idid/],
};

//JWT 字符串的作用
//以下 错误改正方法并未使用 !!!
// 按照文档敲了一遍注册用户的项目联系，死活发现postman提醒
//"message": "Cannot read property 'body' of undefined" ，经过排查现正式发布半官方解答：是因为文档中说的‘@hapi/joi’这个依赖已经弃用，解决方法如下：
// 1、采用npm install joi能够更新joi模块，
// 2、再把导入模块改为 const joi = require('joi') 就可以了；
// 希望!对各位有帮助，不走冤枉路，谢谢.
