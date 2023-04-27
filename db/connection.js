const mysql = require("mysql");
//直接连接数据库
const db = mysql.createConnection({
    //创建直连接
    host: "127.0.0.1",
    user: "root",
    password: "admin123",
    database: "myxu",
    waitForConnection: true, //当无连接池可用时，等待(true) 还是抛错(false)
    connectionLimit: 20, //连接限制
    queueLimit: 0, //最大连接等待数(0为不限制)
});

module.exports = db;
