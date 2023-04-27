//文件目录删除
const fs = require("fs");

// 读取目录下所有文件名 数组对象返回
const readFoleder = (path) => {
    return fs.readdirSync(path, function (err, files) {
        console.log(object);
        if (err) return err;
        return files;
    });
};

//删除文件目录调用 此函数
const deleteFolederFun = (path) => {
    let files = [];
    //检测目录是否存在
    if (fs.existsSync(path)) {
        //读取目录
        files = readFoleder(path);
        //是否读取成功
        if (files == Error) {
            console.log("文件目录读取失败");
            return files;
        }
        files.forEach(function (file, index) {
            //文件名
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                //递归效用
                deleteFolederFun(curPath);
            } else {
                //删除文件
                fs.unlinkSync(curPath);
            }
        });
        //删除目录
        fs.rmdirSync(path);
    }
    return true;
};
exports.deleteFolder = deleteFolederFun;
