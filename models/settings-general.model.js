const mongoose = require("mongoose");
const generate = require("../helpers/generate");

const settingGeneralSchema = new mongoose.Schema({
    websiteName: String,
    logo: String,
    phone: String,
    email: String,
    address: String,
    copyright: String
}, {
    timestamps: true
});

const SettingGeneralSchema = mongoose.model('SettingGeneralSchema', settingGeneralSchema, "settings-general");

module.exports = SettingGeneralSchema;