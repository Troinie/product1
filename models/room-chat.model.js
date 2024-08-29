const mongoose = require("mongoose");

const roomChatSchema = new mongoose.Schema({
    deleted: {
        title: String,
        avater: String,
        typeRoom: String,
        status: String,
        users: [
            {
                user_id: String,
                role: String
            }
        ],
        type: Boolean,
        fefault: false
    },
    deletedAt: Date
}, {
    timestamps: true
});

const RoomChat = mongoose.model('RoomChat', roomChatSchema, "rooms-chat");
// cart là tên colection trong database

module.exports = RoomChat;