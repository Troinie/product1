const RoomChat = require("../../models/room-chat.model");

module.exports.isAccess = async (req, res, next) => {
    // console.log("luôn chạy vào đây");
    const userId = res.locals.user.id;
    const roomChatId = req.params.roomChatId;

    // console.log(userId);
    // console.log(roomChatId);

    try {
        const isAccessRoomChat = await RoomChat.findOne({
            _id: roomChatId,
            "users.user_id": userId,
            deleted: false
        });

        if (isAccessRoomChat) {
            next();
        } else {
            res.redirect("/");
        }
    } catch (error) {
        res.redirect("/");
    }
};