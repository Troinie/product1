const SettingGeneral = require("../../models/settings-general.model");

// route(link) nào có cái này thì phải đăng nhập với vào đc
module.exports.settingGeneral = async (req, res, next) => {
    const settingGeneral = await SettingGeneral.findOne({});

    res.locals.settingGeneral = settingGeneral;
    
    next();
}