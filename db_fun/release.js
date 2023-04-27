//sql 查询集成 并使用aycnc await
//封装mysql请求

const pool = require("../db");

// 接收一个sql语句 以及所需的values
// 这里接收第二参数values的原因是可以使用mysql的占位符 '?'
//  sql语句  values 内容
exports.querySQL = function (sql, values) {
	// 返回一个 Promise  可以使用 async
	return new Promise((resolve, reject) => {
		//从连接池中取出连接
		pool.getConnection(function (err, connection) {
			if (err) {
				reject(err); //返回连接错误
			} else {
				console.log("已取出连接 查询中");
				console.log(sql);
				console.log(values);
				connection.query(sql, values, (err, result) => {
					if (err) {
						reject(err); //console.log("查询报错");
					} else {
						resolve(result); // console.log("查询正确");
					}
					// 结束会话
					connection.release(); //执行完一次数据操作，将连接放回连接池
					// pool.releaseConnection(connection);
				});
			}
		});
	});
};
