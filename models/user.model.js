const mongoose = require("mongoose");
const generate = require("../helpers/generate");

const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    tokenUser: {
        type: String,
        default: generate.generateRandomString(20)
    },
    phone: String,
    avatar: String,
    friendList: [
        {
            user_id: String,
            room_chat_id: String
        }    
    ],
    acceptFriends: Array, // những người gửi yêu cầu cho mình
    requestFriends: Array, // mình gửi yêu cầu cho người khác
    statusOnline: String,
    status: {
        type: String,
        default: "active"
    },
    deleted: {
        type: Boolean,
        default: false // người dùng k truyền vào thì mặc định là false
    },
    deleteAt: Date
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema, "users");
// users là tên colection trong database

module.exports = User;