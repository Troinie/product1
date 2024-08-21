const mongoose = require("mongoose");
const generate = require("../helpers/generate");

const accountSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    token: {
        type: String,
        default: generate.generateRandomString(20)
    },
    phone: String,
    avatar: String,
    role_id: String,
    status: String,
    deleted: {
        type: Boolean,
        default: false // người dùng k truyền vào thì mặc định là false
    },
    deleteAt: Date
}, {
    timestamps: true
});

const Account = mongoose.model('Account', accountSchema, "accounts");
// products là tên colection trong database

module.exports = Account;