// 查找好友列表
const express = require("express");
const router = express.Router();
const friend = require("../router_handler/friend");
//导入实时验证
const expressJoi = require("@escook/express-joi");
//导入验证规则
const { idList, idid } = require("../schema/friend");
router.post("/idid", friend.idid); //添加好友  需要添加好友的id 和自己的token
router.post("/idList", friend.idList); //获取好友列表 需要获取好友列表的 id
router.post("/deleteId", friend.deleteId);
router.get("/queryIdUserif", friend.queryIdUserif);
module.exports = router;
