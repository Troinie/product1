const ProductCategory = require("../../models/product-category.model");

const systemConfig = require("../../config/system");

const createTreeHelper = require("../../helpers/createTree");

const paginationHelper = require("../../helpers/pagination");

const filterStatusHelpers = require("../../helpers/filterStatus");

const searchHelpers = require("../../helpers/search");

// [GET] /admin/products-category
module.exports.index = async (req, res) => {
    const filterStatus = filterStatusHelpers(req.query);

    let find = {
        deleted: false
    }

    if (req.query.status)
        find.status = req.query.status;

    let sort = {};

    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.position = "desc";
    }

    // ô nhập từ khoá trong danh sách sản phẩm
    const objectSearch = searchHelpers(req.query);

    if (objectSearch.regex)
        find.title = objectSearch.regex;

    // pagination
    const countProducts = await ProductCategory.countDocuments(find);

    let objectPagination = paginationHelper({
            currentPage: 1,
            limitItem: 5
        },
        req.query,
        countProducts
    );

    // lấy ra các danh mục sp
    const records = await ProductCategory.find(find)
        .sort(sort)
        .limit(objectPagination.limitItem)
        .skip(objectPagination.skip);

    const newRecords = createTreeHelper.tree(records);

    res.render("admin/pages/products-category/index", {
        pageTitle: "Danh mục sản phẩm",
        records: newRecords,
        pagination:  objectPagination,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword
    });
}


// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };

    const records = await ProductCategory.find(find);

    const newRecords = createTreeHelper.tree(records);
    // console.log(newRecords);

    res.render("admin/pages/products-category/create", {
        pageTitle: "Tạo danh mục sản phẩm",
        records: newRecords
    });
}


// [POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {
    if (req.body.position == "") {
        const count = await ProductCategory.countDocuments();
        req.body.position = count + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    const record = new ProductCategory(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/products-category`);

}


// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {

    // dùng try catch vì khi ngta nhập trên url có thể bị sập web
    try {       
        const id = req.params.id;

        const data = await ProductCategory.findOne({
            _id: id,
            deleted: false
        });

        const records = await ProductCategory.find({
            deleted: false
        });

        const newRecords = createTreeHelper.tree(records);

        res.render("admin/pages/products-category/edit", {
            pageTitle: "Chỉnh sửa danh mục sản phẩm",
            data: data,
            records: newRecords
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
}


// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    req.body.position = parseInt(req.body.position);

    await ProductCategory.updateOne({
        _id: id
    }, req.body);

    res.redirect("back");
}

// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await ProductCategory.findOne(find);

        res.render("admin/pages/products-category/detail", {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }

}


// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    //xoá vĩnh viễn
    // await Product-category.deleteOne({ _id: id });

    //xoá mềm
    await ProductCategory.updateOne({
        _id: id
    }, {
        deleted: true,
        deleteAt: new Date()
    });

    req.flash("success", `Đã xoá thành công sản phẩm!`);

    res.redirect("back");
}


// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await ProductCategory.updateOne({
        _id: id
    }, {
        status: status
    });

    req.flash("success", "Cập nhật trạng thái thành công!");

    res.redirect("back");
};


// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    switch (type) {
        case "active":
            await ProductCategory.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "active"
            });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;

        case "inactive":
            await ProductCategory.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "inactive"
            });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;

        case "delete-all":
            await ProductCategory.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                deleted: true,
                deleteAt: new Date()
            });
            req.flash("success", `Đã xoá thành công ${ids.length} sản phẩm!`);
            break;

        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);
                await ProductCategory.updateOne({
                    _id: id
                }, {
                    position: position
                });

                req.flash("success", `Đã đổi vị trí thành công ${ids.length} sản phẩm!`);

            }
            break;

        default:
            break;
    }

    res.redirect("back");
}