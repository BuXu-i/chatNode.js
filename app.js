const express = require("express");
const app = express(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" }); //好像是设置默认请求头
    res.end("okay");
});
//
// 跨域访问
//npm i cors -S
const cors = require("cors");
app.use(cors());

//导入   建立sockter
const io = require("./sockter/io");

//挂载 返回 函数
app.use((req, res, next) => {
    // status = true 为成功； state = false 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
    res.ret = function (err, state = false) {
        console.log(err instanceof Error ? err.message : err);
        res.json({
            // 状态
            state,
            // 状态描述，判断 err 是 错误对象 还是 字符串
            message: err instanceof Error ? err.message : err,
        });
    };
    //状态码  给能判为真即可
    res.urn = function (data, state = 200) {
        res.json({
            // 状态
            state,
            // 状态描述，判断 err 是 错误对象 还是 字符串
            ...data,
        });
    };
    next();
});

//挂载静态资源
app.use("/node", express.static("./public"));

//解析token字符串
const expressJWT = require("express-jwt");
const config = require("./config");
app.use(
    [
        "/space/release", //发布内容
        "/space/deleteRelease", //删除发布内容
        "/space/comment", //发布评论
        "/space/deleteComment", //删除评论
        "/friend/idid", // 添加好友
        "/friend/deleteId", //删除好友
        "/user/loginState", //查询登录状态
    ], //保护特定的 路径开头
    //会解析token字符串 挂在到user上
    expressJWT({ secret: config.jwrSecrekey })
    // expressJWT({ secret: config.jwrSecrekey }).unless({ path: config.path })
);

//解析携带参数
//解析表单数据
// app.use(express.urlencoded({ extended: false }))
const bodyParser = require("body-parser");

// app.use(bodyParser.json({ limit: "1mb" })); //body-parser 解析json格式数据
// 解析表单  www-xh
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
//解析json
app.use(bodyParser.json());
//
//
//解析get 数据请求
const { parserGet } = require("./parser/get");
app.use(parserGet);

//挂载中间件函数
//个人登录注册等

const user = require("./router/user");
app.use("/user", user);

//
//发布个人空间//好友或者世界可见

const space = require("./router/space");
app.use("/space", space);

//
//
// 获取好友列表
const friend = require("./router/friend");
app.use("/friend", friend);
//
const joi = require("joi");
//全局的错误中间件 当发生错误时就会调用  在所有路由之后
app.use((err, req, res, next) => {
    console.log("发生错误");
    // console.log(req.body);
    //数据验证失败
    if (err instanceof joi.ValidationError) {
        console.log("joi 数据验证失败");
        return res.ret(err);
    }
    //token验证失败
    if (err.name == "UnauthorizedError") {
        console.log("token验证失败");
        return res.ret(err.name);
    }
    console.log({ body: req.body, url: req.url });
    //未知错误
    console.log("错误未知");
    console.log(err);
    res.ret(err);
});

// const SSE = require("sse");
// var sseClients = [];
// app.listen(3005, "43.142.189.60", (req, res) => {
//     console.log("启动服务器");
// });
app.listen(3007, "localhost", (req, res) => {
    console.log("启动服务器");
});
