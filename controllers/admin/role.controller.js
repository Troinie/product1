const Role = require("../../models/role.model")

const systemConfig = require("../../config/system");

const paginationHelper = require("../../helpers/pagination");

// [GET] /admin/roles
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    };

    const countProducts = await Role.countDocuments(find);

    let objectPagination = paginationHelper({
            currentPage: 1,
            limitItem: 5
        },
        req.query,
        countProducts
    );

    const records = await Role.find(find)
        .limit(objectPagination.limitItem)
        .skip(objectPagination.skip);

    res.render("admin/pages/roles/index", {
        pageTitle: "Nhóm quyền",
        records: records,
        pagination: objectPagination
    });
}


// [GET] /admin/roles/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/roles/create", {
        pageTitle: "Tạo nhóm quyền"
    });
}


// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
    const record = new Role(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/roles`);
}


// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        let find = {
            _id: id,
            deleted: false
        }

        const data = await Role.findOne(find);

        res.render("admin/pages/roles/edit", {
            pageTitle: "Sửa nhóm quyền",
            data: data
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
}


// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;

        await Role.updateOne({ // update id trong req.body
            _id: id
        }, req.body);

        req.flash("success", "Cập nhật nhóm quyền thành công!")
    } catch (error) {
        req.flash("error", "Cập nhật nhóm quyền thất bại!")
    }

    res.redirect("back");
}


// [GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Role.findOne(find);

        res.render("admin/pages/roles/detail", {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }

}


// [DELETE] /admin/roles/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    //xoá vĩnh viễn
    // await Product.deleteOne({ _id: id });

    //xoá mềm
    await Role.updateOne({
        _id: id
    }, {
        deleted: true,
        deleteAt: new Date()
    });

    req.flash("success", `Đã xoá thành công sản phẩm!`);

    res.redirect("back");
}