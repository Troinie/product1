const User = require("../../models/user.model");

const ForgotPasword = require("../../models/forgot-pasword.model");

const Cart = require("../../models/cart.model");

const generateHelper = require("../../helpers/generate");

const sendMailHelper = require("../../helpers/sendMail");

const md5 = require("md5");
const e = require("express");

// [GET] /user/register
module.exports.register = async (req, res) => {
    res.render("client/pages/user/register", {
        pageTitle: "Đăng ký tài khoản"
    });
}


// [POST] /user/register
module.exports.registerPost = async (req, res) => {
    // check email có tồn tại k
    const existEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if (existEmail) {
        req.flash("error", `Email đã tồn tại!`);
        res.redirect("back");
        return;
    }

    req.body.password = md5(req.body.password);

    const user = new User(req.body);
    await user.save();

    res.cookie("tokenUser", user.tokenUser);

    res.redirect("/");
}


// [GET] /user/login
module.exports.login = async (req, res) => {
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập tài khoản"
    });
}


// [POST] /user/login
module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        req.flash("error", `Email không tồn tại!`);
        res.redirect("back");
        return;
    }

    if (md5(password) != user.password) {
        req.flash("error", `Sai mật khẩu!`);
        res.redirect("back");
        return;
    }

    if (user.status == "inactive") {
        req.flash("error", `Tài khoản đang bị khoá!`);
        res.redirect("back");
        return;
    }

    res.cookie("tokenUser", user.tokenUser);

    // lưu user_id vào model cart(giỏ hàng)
    await Cart.updateOne({
        _id: req.cookies.id
    }, {
        user_id: user.id
    });

    res.redirect("/");
}


// [GET] /user/logout
module.exports.logout = async (req, res) => {
    // xoá cookies
    res.clearCookie("tokenUser");

    res.redirect("/");
}


// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
    res.render("client/pages/user/forgot-password", {
        pageTitle: "Lấy lại mật khẩu",
    });
};


// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        req.flash("error", `Email không tồn tại!`);
        res.redirect("back");
        return;
    }

    // việc 1: tạo mã OTP và lưu thông tin yêu cầu vào collection forgot-pasword
    const otp = generateHelper.generateRandomNumber(6);

    const objectForgotPasword = {
        email: email,
        otp: otp,
        expireAt: Date.now()
    }

    const forgotPassword = new ForgotPasword(objectForgotPasword);
    await forgotPassword.save();

    // việc 2: gửi mã OTP qua email của user
    const subject=`Mã OTP xác minh lấy lại mật khẩu`;
    const html=`Mã OTP xác minh lấy lại mật khẩu là <b>${otp}</b>. Thời gian sử dụng là 1'30s. Lưu ý không để lộ mã OTP.`

    sendMailHelper.sendMail(email, subject, html);

    res.redirect(`/user/password/otp?email=${email}`);

};


// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.query.email;

    res.render("client/pages/user/otp-password", {
        pageTitle: "Nhập mã OTP",
        email: email
    });
};


// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPasword.findOne({
        email: email,
        otp: otp
    });

    if(!result){
        req.flash("error", `OTP không hợp lệ!`);
        res.redirect("back");
        return;
    }

    const user = await User.findOne({
        email: email
    });

    res.cookie("tokenUser", user.tokenUser);

    res.redirect("/user/password/reset");
};


// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
    res.render("client/pages/user/reset-password", {
        pageTitle: "Nhập mã OTP"
    });
};


// [GET] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
    const password = req.body.password;
    const tokenUser = req.cookies.tokenUser;

    await User.updateOne({
        tokenUser: tokenUser
    },{
        password: md5(password)
    });

    req.flash("success", "Đổi mật khẩu thành công!");

    res.redirect("/");
};


// [GET] /user/info
module.exports.info = async (req, res) => {
    res.render("client/pages/user/info", {
        pageTitle: "Thông tin tài khoản"
    });
};
