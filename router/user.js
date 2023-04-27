const express = require("express");
const router = express.Router();
const user = require("../router_handler/user");
//导入实时验证
const expressJoi = require("@escook/express-joi");
//导入验证规则
const { reguser, login } = require("../schema/user");
//   系统分配        学校             其他信息     姓名
// 注册用户 提供  id        school      other     name
//
//  昵称         密码       电话          学号      性别(默认0)
//nickname   password    telephone     studentid  sex
//
// 头像base64(默认null)    账户是否删除(默认0)
//    headimg                is_delete
//
// 用户表\nid 系统分配 作为账户\nid 昵称 电话唯一 且非空
//sex 1 表示默认 男
router.post("/reguser", expressJoi(reguser), user.reguser); //注册
router.post("/login", expressJoi(login), user.login); //登录
router.get("/loginState", user.loginState); //查询登录状态 会传入token 需要返回个人信息
// router.post("/login", user.login); //登录
//
//
//
//
module.exports = router; //导出router
