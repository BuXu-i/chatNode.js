const express = require("express");
const router = express.Router();
const space = require("../router_handler/space");
//导入实时验证
const expressJoi = require("@escook/express-joi");
//导入验证规则
const { release } = require("../schema/space");
// id int PK   //id  存在于token
// time varchar(80)//时间戳  没有 后端会生成
// text text //文字 必须有
// is_img  是否有图片  有 图片依据id  和time  直接找文件夹
// comment text//评论 可空
//is_private tinyint  默认0 私密好友 1公开世界
//is_delete  是否删除  0未删除默认
//上传空间  space-空间   release-发布

//发布内容
router.post("/release", expressJoi(release), space.release);
//查询 发布内容  三种 查询世界0 个人1 好友
router.get("/queryRelease", space.queryRelease);
//修改自己发布的内容 不提供此功能
router.post("/updataRelease", space.updataRelease);
//删除发布内容  提供token 删除发布内容的时间戳
router.post("/deleteRelease", space.deleteRelease);
//评论
router.post("/comment", space.comment);
//delete comment  删除评论
router.post("/deleteComment", space.deleteComment);
module.exports = router;
