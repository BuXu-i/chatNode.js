//将函数 以属性的方式向外挂载
//exports有多个属性，这样写是不会覆盖先前写的向外暴露的函数
const db = require("../db/index"); //导入数据库模块
const bcrypt = require("bcryptjs"); //引入加密 密码包
const config = require("../config"); //导入token加密字符串
const jwt = require("jsonwebtoken"); //加密token字符串

const sql_query = `select * from user where nickname=? or telephone=? or studentid=?`; //查询语句
const sql_i_reguser = "insert into user set ?"; //插入语句
const sql_count = "select  count(id) from user"; //查询用户表中总共有多少条数据 依据生成id
const { schoo_id } = require("../state/index"); //学校id 生成 依据
const sql_login = "select id , password,nickname,headimg from user where id=?"; //登录sql
// const sqlfied = "select * from ev_users where nickname=?"; //查询语句
//sex 1 表示男
function opid(count, count_school, sex = "1") {
	console.log("生成id函数");
	return (
		"0".repeat(3 - count_school.toString().length) +
		count_school +
		"0".repeat(4 - count.toString().length) +
		count +
		sex
	);
}
//必须 传入参数 只有其他信息不用传入   有默认值的不需要传入
exports.reguser = (req, res) => {
	console.log("注册语句");
	console.log(req.body);
	//查询昵称,学号,电话，是否有重复 有的话!!!  查看是否被删除(暂时不提供账户销毁)
	let {
		school,
		name,
		nickname,
		password,
		telephone,
		// studentid,
		sex = 1,
	} = req.body;
	console.log("结构 " + nickname + " " + telephone + " " + " ok");
	db.query(
		sql_query,
		[nickname, telephone], //昵称 电话  需要唯一
		function (err, results) {
			console.log("查询数据库中");
			if (err) {
				console.log("数据库错误");
				return res.ret(err);
			} else {
				console.log("成功");
				if (results.length > 0) {
					console.log("nickname, telephone重复");
					return res.ret("nickname, telephone重复");
				} else {
					//生成 用户唯一id表标识 学校3 用户序号4 性别1 共计八位
					let count = null; //id序号
					let count_school = null; //学校序号
					let id = null;
					db.query(sql_count, (err, result) => {
						if (err) {
							console.log("查询user表中数据条数失败");
							return res.ret(err + "查询表中数据条数失败");
						} else {
							// 加密 密码
							//存储用户信息
							//参数列表(明文密码,随机盐的长度)  //加密
							password = bcrypt.hashSync(password, 10);
							count = result[0]["count(id)"] + 1;
							//生成用户唯一id表示
							if ((school = "")) {
								//根据传入的学校生成id中一个标识  传入未kong时  id为x
								count_school = "x";
							} else {
								count_school = schoo_id[school];
							}
							console.log(count_school);
							if (count_school > 0) {
								console.log("学校序号生成成功");
								//注册 功能
								id = opid(count, count_school, sex);
								console.log(id);
								db.query(
									//生成id   password 加密
									sql_i_reguser,
									{
										id,
										school,
										name,
										nickname,
										password,
										telephone,
										// studentid,//学号不要
										sex,
									},
									(err, results) => {
										console.log("??");
										console.log(id);
										if (err) {
											console.log("数据插入失败");
											return res.ret(err);
										} else {
											console.log("用户注册成功");
											return res.ret(results, true);
										}
									}
								);
							} else {
								console.log("依据学校生成序号失败 " + school);
								return res.ret("依据学校生成序号失败 " + school);
							}
						}
					});
				}
			}
		}
	);
};
//登录 暂时只支持id和密码登录
exports.login = (req, res) => {
	console.log("接受到登录请求 下面是获取的body");
	// let op = JSON.stringify(req.body);
	// console.log(op);
	// op = JSON.parse(op);
	// console.log(op);
	console.log("body 数据");
	console.log(req.body);
	const { id, password } = req.body;
	db.query(sql_login, [id], function (err, results) {
		console.log("查询数据库中");
		if (err) {
			console.log("数据库查询失败");
			return ret("数据库查询失败 " + results);
		}
		//比对密码
		console.log("登录时 数据查询到数据");
		console.log(results);
		if (results.length == 0) {
			console.log("未查找到该id");
			return res.ret("未查找到该id");
		}
		//对比密码

		if (bcrypt.compareSync(password, results[0].password)) {
			console.log("登陆成功");
			//返回token
			const user = { ...results[0], password: "" }; //生成token字符串返回
			//  console.log(user);   加密字符串    有效时间  expires过期
			const tokenStr = jwt.sign(user, config.jwrSecrekey, {
				expiresIn: config.expresin,
			});
			return res.json({
				state: true,
				message: "登陆成功",
				id: id + "",
				nickname: results[0].nickname,
				headimg: results[0].headimg,
				// token: tokenStr,
				token: "Bearer " + tokenStr,
			});
		} else {
			console.log("密码错误");
			return res.ret({ message: "密码错误" });
		}
	});
};

exports.loginState = (req, rse) => {
	//解析token字符串 挂在到user上
	console.log(req.user);
	rse.urn({ user: req.user });
};
//上传头像等。。。

//修改信息
