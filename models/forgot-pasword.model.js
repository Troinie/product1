const mongoose = require("mongoose");
const generate = require("../helpers/generate");

const forgotPasswordSchema = new mongoose.Schema({
    email: String,
    otp: String,

    // thời gian hết hạn OTP
    expireAt: {
        type: Date,
        expires: 90
    }
}, {
    timestamps: true
});

const ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema, "forgot-pasword");
// products là tên colection trong database

module.exports = ForgotPassword;