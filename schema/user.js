//审核
const joi = require("joi");

// string() 值必须是字符串
// alphanum()值只能是包含a-zA-Z0-9 的字符串
// ★min(length)最小长度
// ★max(length) 最大长度
// ★required() 值是必填项，不能为undefined (可以写正则表达式)值必须符合正则表达式的规则
// const joi = require('joi')
// router.post('/reguser', expressJoi(reg_login_schema), userHandler.regUser)

const id = joi.string().required(/^[0-9]{8}$/);
//其他信息
// const other = joi;
//姓名  字符串                     最小  最大
const name = joi.string().min(1).max(5);
//昵称
const nickname = joi.string().required();
//字符串      正则表达式              不允许重复提交
//密码
const password = joi
    .string()
    .pattern(/^.{7,12}$/)
    .alphanum()
    .required();
// 电话
const telephone = joi.required(
    /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/
);
// 学号
// const studentid = joi.required(/^\d{11}$/);
//头像
// const headimg = joi; schema
exports.reguser = {
    body: {
        name,
        nickname,
        password,
        telephone,
        // studentid,
        // headimg,
    },
};

exports.login = {
    body: {
        id: id, //账户
        password, //密码
    },
};
