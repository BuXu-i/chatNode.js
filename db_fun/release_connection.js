//sql 查询集成 并使用aycnc await
//封装mysql请求

const pool = require("../db/connection");
//直连接数据库的 封装操作
// 接收一个sql语句 以及所需的values
// 这里接收第二参数values的原因是可以使用mysql的占位符 '?'
// 比如 query(`select * from my_database where id = ?`, [1])
//  sql语句  values 内容
exports.queryRelease = function (sql, values) {
    // 返回一个 Promise  可以使用 async
    return new Promise((resolve, reject) => {
        // 二、连接数据库
        pool.connect(function (err) {
            if (err) {
                console.error("连接失败" + err);
                return;
            }
        });
        // 三、对数据表操作
        pool.query(sql, function (err, results, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
        // 四、关闭连接
        pool.end();
    });
};
