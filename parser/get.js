exports.parserGet = (req, rse, next) => {
    console.log("检查get请求");
    req.method = req.method.toUpperCase(); //转换大写
    console.log(req.url.indexOf("?")); //有问号 代表后面携带了参数  可以进行解析
    if (req.url.indexOf("?") != -1 && req.method == "GET") {
        // 解析get请求
        console.log(req.url);
        let url = req.url;
        url = url.split("?")[1].split("&");
        let bodyget = {};
        let pp = [];
        for (id in url) {
            pp = url[id].split("=");
            bodyget[pp[0]] = pp[1];
        }
        req.body = bodyget;
        console.log(req.body);
    }
    next();
};
