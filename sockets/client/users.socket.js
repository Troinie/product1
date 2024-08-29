const User = require("../../models/user.model");
const RoomChat = require("../../models/room-chat.model");

module.exports = async (res) => {
    _io.once('connection', (socket) => {
        // người dùng gửi yêu cầu kết bạn
        socket.on("CLIENT_ADD_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;

            // console.log(myUserId); // id của A (người gửi)
            // console.log(userId); // id của B

            // thêm id của A vào acceptFriends của B
            const existUserAinB = await User.findOne({
                _id: userId,
                acceptFriends: myUserId
            });

            if (!existUserAinB) {
                await User.updateOne({
                    _id: userId
                }, {
                    $push: {
                        acceptFriends: myUserId
                    }
                });
            }

            // thêm id của B vào requestFriends của A
            const existUserBinA = await User.findOne({
                _id: myUserId,
                requestFriends: userId
            });

            if (!existUserBinA) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $push: {
                        requestFriends: userId
                    }
                });
            }

            // lấy độ dài acceptFriends của B để trả về cho B
            const infoUserB = await User.findOne({ 
                _id: userId
            });

            const lengthAcceptFriends = infoUserB.acceptFriends.length;

            socket.broadcast.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIEND", { 
                userId: userId,
                lengthAcceptFriends: lengthAcceptFriends
            }); 
            
            // lấy thông tin của A trả về cho B
            const infoUserA = await User.findOne({
                _id: myUserId
            }).select("id avatar fullName");

            socket.broadcast.emit("SERVER_RETURN_INFO_ACCEPT_FRIEND", { 
                userId: userId,
                infoUserA: infoUserA
            }); 
        });


        // người dùng huỷ gửi yêu cầu kết bạn
        socket.on("CLIENT_CANCEL_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;

            // console.log(myUserId); // id của A (người gửi)
            // console.log(userId); // id của B

            // xoá id của A vào acceptFriends của B
            const existUserAinB = await User.findOne({
                _id: userId,
                acceptFriends: myUserId
            });

            if (existUserAinB) {
                await User.updateOne({
                    _id: userId
                }, {
                    $pull: {
                        acceptFriends: myUserId
                    } // xoá
                });
            }

            // xoá id của B vào requestFriends của A
            const existUserBinA = await User.findOne({
                _id: myUserId,
                requestFriends: userId
            });

            if (existUserBinA) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $pull: {
                        requestFriends: userId
                    }
                });
            }

            // lấy độ dài acceptFriends của B để trả về cho B
            const infoUserB = await User.findOne({ 
                _id: userId
            });

            const lengthAcceptFriends = infoUserB.acceptFriends.length;

            socket.broadcast.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIEND", { 
                userId: userId,
                lengthAcceptFriends: lengthAcceptFriends
            });  
            
            // lấy userId của A để trả về cho B
            socket.broadcast.emit("SERVER_RETURN_USER_ID_CANCEL_FRIEND", { 
                userId: userId,
                userIdA: myUserId
            }); 
        });


        // người dùng từ chối yêu cầu kết bạn
        socket.on("CLIENT_REFUSE_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;

            // console.log(myUserId); // id của B (người gửi)
            // console.log(userId); // id của A

            // xoá id của A vào acceptFriends của B
            const existUserAinB = await User.findOne({
                _id: myUserId,
                acceptFriends: userId
            });

            if (existUserAinB) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $pull: {
                        acceptFriends: userId
                    } // xoá
                });
            }

            // xoá id của B vào requestFriends của A
            const existUserBinA = await User.findOne({
                _id: userId,
                requestFriends: myUserId
            });

            if (existUserBinA) {
                await User.updateOne({
                    _id: userId
                }, {
                    $pull: {
                        requestFriends: myUserId
                    }
                });
            }
        });

        
        // người dùng chấp nhận kết bạn
        socket.on("CLIENT_ACCEPT_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;

            // console.log(myUserId); // id của B
            // console.log(userId); // id của A

            // lấy ra users đã tồn tại
            const existUserAinB = await User.findOne({
                _id: myUserId,
                acceptFriends: userId
            });

            const existUserBinA = await User.findOne({
                _id: userId,
                requestFriends: myUserId
            });

            let roomChat;

            // tạo phòng chat
            if(existUserAinB && existUserBinA){
                roomChat = new RoomChat({
                    typeRoom: "friend",
                    users: [
                        {
                            user_id: userId,
                            role: "superAdmin"
                        },
                        {
                            user_id: myUserId,
                            role: "superAdmin"
                        },
                    ],
                });
                await roomChat.save();
            }

            // thêm {user_id, room_chat_id} của A vào friendList của B
            // xoá id của A vào acceptFriends của B
            
            if (existUserAinB) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $push: {
                        friendList: {
                            user_id: userId,
                            room_chat_id: roomChat.id
                        }
                    },
                    $pull: {
                        acceptFriends: userId
                    } // xoá
                });
            }

            // thêm {user_id, room_chat_id} của B vào friendList của A
            // xoá id của B vào requestFriends của A

            if (existUserBinA) {
                await User.updateOne({
                    _id: userId
                }, {
                    $push: {
                        friendList: {
                            user_id: myUserId,
                            room_chat_id: roomChat.id
                        }
                    },
                    $pull: {
                        requestFriends: myUserId
                    }
                });
            }
        });
    });
};