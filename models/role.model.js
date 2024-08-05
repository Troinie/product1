const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    title: String,
    description: String,
    permissions: { // nhóm quyền
        type: Array,
        default: []
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deleteAt: Date
}, {
    timestamps: true
});

const Role = mongoose.model('Role', roleSchema, "roles");
// roles là tên colection trong database

module.exports = Role;