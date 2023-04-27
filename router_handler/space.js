//发布内容
const db = require("../db/index"); //导入数据库模块
const sql_i_release = "insert into space set ?"; //插入语句
//user 上有解析出来的token value有id
const fs = require("fs"); //提供文件存储的模块  发布内容中需要存储的照片
//直接 插入到数据库  需要对内容 进行判定
const path = require("path"); //路径   //只要使用run 和 ret 返回 就有成功或失败的标准
//解析from-data 模块
var multiparty = require("multiparty");
let result = null; //暂存 查询的结果
//发布内容
exports.release = (req, res) => {
	//     时间戳   内容  图片地址   评论     默认私密    默认不删除
	const id = req.user.id; //获取到id
	var time = null; //时间戳
	let ph = null; //根据时间戳创建的子文件夹
	//判断必要参数  //你昵称和头像
	if (
		id == null //id
	)
		return res.ret("数据缺失");
	if (!time) {
		time = new Date().getTime();
	}
	ph = path.join(__dirname, "../public", id.toString(), time.toString());
	console.log(ph);
	//依据time 创建文件夹
	// return res.ret("暂停");
	fs.mkdir(ph, function (err) {
		if (err) {
			console.log("相应文件夹创建失败");
			return res.ret("子文件夹创建失败");
		} else {
			console.log("创建成功");
		}
	});
	/* 生成multiparty对象，并配置上传目标路径 */
	let form = new multiparty.Form();
	// 设置编码
	form.encoding = "utf-8";
	// 设置文件存储路径，以当前编辑的文件为相对路径  先检查该路径是否存在
	form.uploadDir = ph;
	// parse，表单解析器
	// fields :普通的表单数据
	// files:上传的文件的信息
	let is_img = 1; //是否 有图片默认有
	let text = null; //文字内容
	let is_private = 0; //是不是私密的
	form.parse(req, function (err, fields, files) {
		try {
			let upfile = null;
			if (files.img == undefined) {
				is_img = 0; //数据库中保存没有图片
			} else upfile = files.img; //
			// console.log("图片保存成功 下列是相应信息");
			text = fields.text.join("/n"); //文字信息  必须有
			if (fields.is_private != undefined) {
				is_private = fields.is_private;
			}
			db.query(
				sql_i_release, //图片插入的是路径  不需要评论 is_img 是否有图片
				{ id, time, text, is_img, is_private },
				function (err, result) {
					if (err) return res.ret(err);
					else {
						return res.urn({
							result,
							code: 200,
							msg: "File Success ok",
							file_name: upfile.originalFilename, //文件名
						});
					}
				}
			);
		} catch {
			return res.send({
				code: 401,
				msg: "File error",
				more_msg: err,
			});
		}
	});
};

//若是第二次查询  需要再更新十条
//    查询世界内容0    查看自己发布的内容1   查看单个好友发布的内容2   查询好友列表发布的内容 其他
const { querySQL } = require("../db_fun/release");
let sql_query_release = null;
exports.queryRelease = async (req, rse) => {
	//查询 发布内容 找 10 条
	sql_query_release = "select * from space where is_delete=0 and time<=?"; //需要进行三种形式的组装 //查找十条
	console.log("开始查询发布内容");
	// identifier//标识符 来决定sql 的 组装
	//传入参数  需要 id 起始时间time  请求条数 count
	const { count, identifier, time, id } = req.body;
	const values = [time]; //时间戳
	if (identifier == 0) {
		//世界 0
		sql_query_release += " and is_private=?";
		values.push(0); //是否公开
	} else if (identifier == 1) {
		//私人 1  查询自己的那就随意了
		sql_query_release += " and id=?";
		values.push(id * 1); //只查找自己发布的
	} else if (identifier == 2) {
		//查看单个好友
		//1. 查询是否为好友关系  2. 查询
		const id_ = req.body.id_; //查询好友id
		const sql_idisid =
			"select count(*)  from friend where ((id=? and id_=?) or (id_=? and id=?)) and is_delete=0";
		try {
			result = await querySQL(sql_idisid, [id, id_, id, id_]);
		} catch (err) {
			rse.ret(err);
		}
		console.log("结果获取");
		console.log(result);
		if (result[0]["count(*)"] > 0) {
			sql_query_release += " and id=?";
			values.push(id_ * 1); //查找单个好友发布的
		} else {
			return rse.ret({ message: "不为好友" });
		}
	} else {
		//朋友 2  查询id的所有好友好友
		//查询所有 好友 语句 包括自己
		console.log("查询好友");
		const sql_idList =
			"select * from friend where ( id=? or id_=? ) and is_delete=0";
		let result_friendList = null;
		try {
			result_friendList = await querySQL(sql_idList, [id, id]);
		} catch (err) {
			rse.ret(err);
		}
		//查询好友列表的结果
		console.log("查询好友列表的结果");
		console.log(result_friendList);
		// let arr = new Array(); //将查询到的数据 转化为id 列表 下面查询 各个id的 详细信息
		sql_query_release += " and (";
		result_friendList.forEach((item) => {
			if (item.id == id) {
				sql_query_release += " id=" + item.id_ + " or";
			} else {
				sql_query_release += " id=" + item.id + " or";
			}
		});
		sql_query_release += " id=" + id + ")";
	}
	sql_query_release += " limit 0,?";
	values.push(count * 1);
	//result 结果
	let result_queryPelease = await querySQL(sql_query_release, values);
	console.log(result_queryPelease);
	// 文件夹遍历图片(还没有遍历)  返回查询消息
	return rse.urn(result_queryPelease);
};

//暂时不提供此功能 未实现
//updaterelease 修改内容 根据id和时间戳两个 来确定需要更改的发布内容是那条
//修改自己发布的内容  需要传入token
const sql_updata_release = "updata space  where ";
exports.updataRelease = async (req, rse) => {
	const { identifier } = req.body;
	const id = req.user.id;
	console.log("查找个人发布的内容");
	const result_a = await querySQL(sql_updata_release, values);
};
//删除 delete  需要提供token  删除发布内容的 同时删除文件夹
//提供参数 is_delete id time
const sql_delete_release =
	"update space set  is_delete=? where id=? and time=?";
const { deleteFolder } = require("../fs_fun/index");
exports.deleteRelease = async function (req, rse) {
	const { time, is_delete } = req.body;
	const id = req.user.id;
	if (is_delete != 1 && id != null) {
		return rse.ret({ msg: "提供正确的删除信息" });
	}
	let values = [is_delete * 1, id, time * 1];
	console.log(values);
	const result_a = await querySQL(sql_delete_release, values);
	//检测sql传出的删除 检测sql查询是否成功
	if (result_a.changedRows == 1) {
		//修改行数
		console.log("调用删除函数");
		//选择是否删除 相应的图片//尽量不要选择删除文件//删除文件目录 时  只能删除空目录
		let err = deleteFolder(
			path.join(__dirname, "../public", id.toString(), time.toString())
		);
		if (err == Error) {
			console.log("文件删除失败 或异常终止");
			return rse.ret(err);
		}
	} else {
		return rse.ret({ message: "修改失败,检查传入参数" });
	}
	rse.urn({ message: "ok" });
};
//评论  需要验证token  评论涉及sql 修改
const sql_comment =
	"update space set comment=concat(comment,?) where id=? and time=? and is_delete=0";
exports.comment = async (req, rse) => {
	//带下划线的 是 对方的(发布内容者) , 不带是请求者的(评论者)
	let { time_, time, id_, value } = req.body;
	const id = req.user.id;
	console.log(time);
	if (time == undefined) {
		console.log("内容时间上修改");
		time = new Date().getTime();
	}
	//评论者id 到@ 结束
	let text = "id=" + id + "&time=" + time + "&value=" + value + "@";
	let values = [text, id_, time_];
	const result_a = await querySQL(sql_comment, values);
	console.log(result_a);
	if (result_a.changedRows == 1) {
		rse.urn({ message: "ok" });
	} else {
		rse.ret({ message: "失败" });
	}
};
//删除评论  需要验证token  评论设计 sql
// const sql_delete_comment = //时间戳不一定是唯一的  需要用id 辅助识别  即 单人发布内容不可能在同一时间
// 时间戳开始(唯一) id 结尾
// "update space set comment=replace(cast(substring(comment,0,8000),VARCHAR),/^id=?.*value=?@$/,'') where id=? and time=? and is_delete=0";

exports.deleteComment = async (req, rse) => {
	//带下划线的 是 对方的(发布内容者) , 不带是请求者的(评论者)
	let { time_, id_, time, value } = req.body;
	const id = req.user.id; //删除自己评论的评论人id
	let values = [id_, time];
	let sql_delete_comment = //时间戳不一定是唯一的  需要用id 辅助识别  即 单人发布内容不可能在同一时间
		"update space set comment=replace(comment,'id=" +
		id +
		"&time=" +
		time_ +
		"&value=" +
		value +
		"@','') where id=? and time=? and is_delete=0";
	//------------------------------------------
	const result_a = null;
	try {
		result_a = await querySQL(sql_delete_comment, values);
	} catch (err) {
		rse.ret(err);
	}
	console.log(result_a);
	if (result_a.changedRows == 1) {
		rse.urn({ message: "ok" });
	} else {
		rse.ret({ message: "失败" });
	}
};
