const joi = require("joi");

const img = joi.required();
const text = joi.required();
const date = joi.required();
//url上还有 是否被世界可见
exports.release = {
    img, //图片
    text, //文字
    date, //时间戳
};
