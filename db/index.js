const mysql = require("mysql");

const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "admin123",
    database: "myxu",
    waitForConnection: true, //当无连接池可用时，等待(true) 还是抛错(false)
    connectionLimit: 200, //连接限制
    queueLimit: 0, //最大连接等待数(0为不限制)
});

module.exports = db;
