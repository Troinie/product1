const User = require("../../models/user.model");

// route(link) nào có cái này thì phải đăng nhập với vào đc
module.exports.requireAuth = async (req, res, next) => {
    if (!req.cookies.tokenUser) {
        res.redirect(`/user/login`);
        return;
    } 

    const user = await User.findOne({
        tokenUser: req.cookies.tokenUser
    }).select("-password");

    if (!user) {
        res.redirect(`/user/login`);
        return;
    }
    
    next();
}