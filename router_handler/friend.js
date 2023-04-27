//获取好友列表
//导入sql db
const db = require("../db/index");
//查找共同好友
const sql_ididFriend =
	"select * from friend where id=(select id from friend where id_=? and is_delete=0) and is_delete=0";
//是否为好友
const sql_idisid =
	"select count(*) as count from friend where id=? and id_=? and is_delete=1 or (id_=? and id=? and is_delete=1)";
//成为好友  //更改sql 需要检查 token凭证
const sql_idid = "insert into friend set ?";
//以下 是 添加好友   要修改sql 故检查token
exports.idid = function (req, rse) {
	console.log(req.body);
	let id_ = req.body.id_ + "";
	let id = req.user.id + "";
	console.log("添加中");
	console.log(id_);
	console.log(id);
	if (id == id_) {
		return rse.ret("不能添加自己");
	}
	//查询添加好友的人是否在数据库中
	const sql_id = "select count(*) as count from user where id=?";
	db.query(sql_id, id_, (err, result) => {
		if (err) return rse.ret(err);
		if (result.count == 0) return rse.ret("为查询到此人  此id不存在", true);
		db.query(
			sql_idisid,
			[id, id_, id, id_], //甲方id 和 乙方id
			(err, result) => {
				console.log(result[0].count);
				if (err) return rse.ret(err);
				if (result[0].count > 0) {
					const sql_deleteId =
						"update friend set is_delete=0 where (id=? and id_=?) or (id=? and id_=?) and is_delete=1";
					db.query(sql_deleteId, [id, id_, id_, id], (err, result) => {
						console.log(result);
						if (result.changedRows == 1) rse.urn({ message: "添加好友成功" });
						else rse.ret({ message: "添加失败" });
						return;
					});
					return;
				}
				db.query(sql_idid, { id, id_ }, (err, result) => {
					// return rse.ret(" 暂停", 1);
					if (err) return rse.ret(err);
					if (result?.length > 0) {
						return rse.ret("添加成功", true);
					} else {
						// return rse.ret("添加失败");
						/***************8 */
						/******************************** */
					}
				});
			}
		);
	});
};
//查询好友列表 返回的是id列表
//获取好友列表
const sql_idList =
	"select * from friend where ( id=? or id_=? ) and is_delete=0";
exports.idList = function (req, rse) {
	console.log("获取好友列表");
	console.log(req.body);
	let id = req.body.id + "";
	db.query(sql_idList, [id, id], (err, result) => {
		if (err) {
			console.log("数据库错误");
			return rse.ret(err);
		}
		// console.log(Object.keys(result).length);
		console.log(result.length);
		if (result.length == 0) {
			return rse.ret("未查询到好友", true);
		}
		console.log("处理获得的结果 处理后 查询昵称 和 head_img");
		let arr = new Array(); //将查询到的数据 转化为id 列表 下面查询 各个id的 详细信息
		result.forEach((item) => {
			console.log(item.id);
			if (item.id == id) {
				arr.push(item.id_);
			} else {
				arr.push(item.id);
			}
		});
		let sqlstr = "id=" + arr.join(" or id=");
		// return rse.ret("未查询到好友", true);
		const sql_nick = "select nickname,headimg,id from user where " + sqlstr;
		console.log(sql_nick);
		db.query(sql_nick, (err, result) => {
			if (err) {
				console.log("数据库错误");
				return rse.ret(err);
			}
			console.log(result);
			return rse.send({
				status: true,
				message: "查询成功",
				idlist: result,
			});
		});
	});
};
const { querySQL } = require("../db_fun/release.js");
let result = null; //暂存查询sql信息
//删除好友 验证token
const sql_deleteId =
	"update friend set is_delete=1 where (id=? and id_=?) or (id=? and id_=?) and is_delete=0";
exports.deleteId = async (req, rse) => {
	let id_ = req.body.id + "";
	let id = req.user.id + "";
	console.log("删除的id 删除中");
	console.log(id + " " + id_);
	if (id_ == id) {
		return rse.ret({ message: "不能删除自己" });
	}
	``;
	result = await querySQL(sql_deleteId, [id, id_, id_, id]);
	console.log(result);
	if (result.changedRows == 1) {
		rse.urn({ message: "ok 删除好友成功" });
		return;
	} else {
		rse.ret({ message: "未成为好友或者删除失败" });
		return;
	}
};
//查询好友的详细信息  id  查询对象的id affected Rows
//查询成功后只返回昵称和id  其他信息 需要再返回                    is_delete
let sql_queryIdUserif = "select * from user where id=? and is_delete=0";
exports.queryIdUserif = async (req, rse) => {
	console.log("查询开始");
	const id = req.body.id;
	try {
		result = await querySQL(sql_queryIdUserif, [id]);
	} catch (err) {
		console.log("错误");
		return rse.ret(err);
	}
	console.log(result);
	const { nickname } = result[0];
	return rse.urn({ message: "ok", user: { nickname } });
};
function editId(id) {
	if (id.length == 8) {
		return;
	} else {
		console.log("........................");
		id = id + "";
		id = "00" + id;
		console.log(id);
		return id;
	}
}
