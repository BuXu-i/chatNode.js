const io = require("socket.io")(3005);
const users = {}; //用于保存连接的用户  socket表示连接者
const users_ioid = []; //用户唯一io标识
let group_info = {}; //群聊 的详细信息
io.sockets.on("connection", function (socket) {
    socket.on("online", (username) => {
        users[username.id + ""] = {
            state: true, //存储连接者的所有状态 其他信息 可以存于此
        };
        users_ioid[socket.id] = username.id + ""; //再创建一个是为了 断开连接后便于清断开连接者
    });
    socket.on("private_chat", (data, fn) => {
        io.emit(data.id, data.news, (err, response) => {
            if (err) {
                console.log("错误");
            }
        });
        fn({ state: true, massgin: "消息转发" });
        console.log("结束");
    });
    socket.on("create_group", (data, fn) => {
        let { name, time, id, nickname, label } = data;
        //群的详细信息
        group_info[id + "&" + time] = {
            //结构表
            name, //群名
            time, //时间戳
            id, //群主  创建者在名字上
            label, //标签
            administrators: [], //成员列表  状态值 表明是房主 管理员 还是成员
        };
        //push 进去创建者信息
        group_info[id + "&" + time][administrators][id + " "] = {
            state: 0, //房主
            id,
            nickname,
        }; //房主进入管理员列表
        //回调函数
        fn({
            state: 200,
            data: {
                groupName: id + "&" + time, //群名
                message: "创建群成功",
            },
        });
    });
    //修改群聊信息  注意权限问题
    socket.on("group_update", (data, fn) => {
        let { id } = data; //修改的群 id
        let groupName = data.groupName; //群存储在列表中的name
        if (
            group_info[groupName].administrators.some((item) => {
                if (item == id + " " && (item.state == 0 || item.state == 1))
                    return true;
            })
        ) {
            fn({ state: false, message: "没有权限!" });
            return;
        }
        // data 中需要修改的选择项
        let update = data.update;
        //修改 群名
        if (update.name != undefined) {
            group_info[groupName].name = update.name;
        } //修改群标签
        if (update.label != undefined) {
            group_info[groupName].label = update.label;
        } //修改管理员  update.is_delete -- true 为增添  false 为减少
        //增添管理员
        let list = update.administrators; //数组[ { id , state } ]
        //增添管理员
        if (list.lenght > 0) {
            //删除管理员 //变成成员
            for (i in list) {
                if (
                    //为0时不能修改 因为为房主
                    group_info[groupName].administrators[list[i].id].state !=
                        0 || //没有该成员
                    group_info[groupName].administrators[list[i].id].state !=
                        undefined
                ) {
                    //修改
                    group_info[groupName].administrators[list[i].id].state =
                        list[i].state;
                }
            }
        } // 是删除 管理员
        fn({ state: 200, message: "修改成功!" });
    });
    //发送消息至群聊   群聊 只要不删除 比如消息记录和群的相关信息 都应该保存至sql  保证 服务器断开连接数据不丢失
    //data 中包含发送至群聊的名字:name 发送者id:id 发送者昵称:nickname  消息:news  时间戳:time
    socket.on("group_news", (data, fn) => {
        if (group_info[data.group] == undefined) {
            console.log("该群不存在"); //id + "&" + time
            fn({
                state: false,
                data: {
                    message: "群未创建 检查群名",
                },
            });
            return;
        }
        io.emit(data.group, data.news, (err, response) => {
            console.log("群发消息 客服端返回的消息");
            console.log(response); //回调函数
        });
        fn({
            state: 200,
            data: {
                message: "发送成功",
            },
        });
        //
    });
    //加入群聊 //是否需要征求群主或管理员同意
    socket.on("group_push", (data, fn) => {
        if (group_info[data.group] == undefined) {
            fn({
                state: false,
                data: {
                    message: "群未创建 检查群名",
                },
            });
            return;
        }
        //将消息转发至群主
        io.emit(group_info[data.group].id, data.userinfo, (err, response) => {
            console.log(response); //回调函数
            if (response.state == 200) {
            } else {
                io.emit(
                    data.userinfo.id,
                    {
                        state: false,
                        data: {
                            message: "被拒绝",
                        },
                    },
                    (err, response) => {
                        console.log(response);
                    }
                );
            }
        });
    });
    //发布公告  或 创建房间功能联动    房间看怎么实现
    socket.on("group_notice", (data, fn) => {
        // 拒绝
    });
    // //连接断开
    socket.on("disconnect", function () {
        if (users[users_ioid[socket.id]]) {
            users[users_ioid[socket.id]].state = false;
            delete users_ioid[socket.id];
        }
        console.log("断开连接 清除连接表中响应id");
    });
    io.emit("this", { will: "be received by everyone" });
});

module.exports = io;
