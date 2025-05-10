const Product = require("../../models/product.model");

const ProductCategory = require("../../models/product-category.model");

const systemConfig = require("../../config/system");

const filterStatusHelpers = require("../../helpers/filterStatus");

const searchHelpers = require("../../helpers/search");

const paginationHelper = require("../../helpers/pagination");

const createTreeHelper = require("../../helpers/createTree");

const Account = require("../../models/account.model");

// [GET] /admin/products
module.exports.index = async (req, res) => {

    const filterStatus = filterStatusHelpers(req.query);

    let find = {
        deleted: false
    }

    if (req.query.status)
        find.status = req.query.status;

    // ô nhập từ khoá trong danh sách sản phẩm
    const objectSearch = searchHelpers(req.query);

    if (objectSearch.regex)
        find.title = objectSearch.regex;

    // let keyword = "";
    // if(req.query.keyword){
    //     keyword = req.query.keyword;
    //     const regex = new RegExp(keyword, "i")
    //     find.title = regex
    // }

    // pagination
    const countProducts = await Product.countDocuments(find);

    let objectPagination = paginationHelper(
        {
            currentPage: 1,  //objectPagination
            limitItem: 5     //objectPagination
        },
        req.query,
        countProducts
    );

    // sort
    let sort = {};

    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.position = "desc";
    }

    const products = await Product.find(find)
        .sort(sort)
        .limit(objectPagination.limitItem)
        .skip(objectPagination.skip);

    for (const product of products) {
        // lấy ra thông tin ng tạo
        const user = await Account.findOne({
            _id: product.createBy.account_id
        });

        if (user) {
            product.accountFullName = user.fullName;
        }

        // lấy ra thông tin ng cập nhật gần nhất
        const updatedBy = product.updatedBy[product.updatedBy.length-1];
        if(updatedBy){
            const userUpdated = await Account.findOne({
                _id: updatedBy.account_id
            });

            updatedBy.accountFullName = userUpdated.fullName;
        }
        
    }

    res.render("admin/pages/products/index", {
        pageTitle: "Trang sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}


// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }

    await Product.updateOne(
        {
            _id: id
        }, 
        {
            status: status,
            $push: {
                updatedBy: updatedBy
            }
        }
    );

    req.flash("success", "Cập nhật trạng thái thành công!");

    res.redirect("back");
};


// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    // console.log(req.body);

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }

    switch (type) {
        case "active":
            await Product.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "active",
                $push: {
                    updatedBy: updatedBy
                }
            });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;

        case "inactive":
            await Product.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "inactive",
                $push: {
                    updatedBy: updatedBy
                }
            });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;

        case "delete-all":
            await Product.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                deleted: true,
                // deleteAt: new Date()
                deleteBy: {
                    account_id: res.locals.user.id,
                    deletedAt: new Date(),
                }
            });
            req.flash("success", `Đã xoá thành công ${ids.length} sản phẩm!`);
            break;

        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);
                await Product.updateOne({
                    _id: id
                }, {
                    position: position,
                    $push: {
                        updatedBy: updatedBy
                    }
                });

                req.flash("success", `Đã đổi vị trí thành công ${ids.length} sản phẩm!`);

            }
            break;

        default:
            break;
    }

    res.redirect("back");
}


// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    //xoá vĩnh viễn
    // await Product.deleteOne({ _id: id });

    //xoá mềm
    await Product.updateOne({
        _id: id
    }, {
        deleted: true,
        deleteBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
        }
    });

    req.flash("success", `Đã xoá thành công sản phẩm!`);

    res.redirect("back");
}


// [GET] /admin/products/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };

    const category = await ProductCategory.find(find);

    const newCategory = createTreeHelper.tree(category);

    res.render("admin/pages/products/create", {
        pageTitle: "Thêm mới sản phẩm",
        category: newCategory
    });
}


// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {

    // if (!req.body.title.length) {
    //     req.flash("error", `Vui lòng nhập tiêu đề ít nhất 8 kí tự!`);
    //     res.redirect("back");
    //     return;
    // }

    // chuyển sang kiểu Number
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);

    if (req.body.position == "") {
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    req.body.createBy = {
        account_id: res.locals.user.id
    }

    const product = new Product(req.body); // tạo 1 sản phẩm
    await product.save(); // lưu sản phẩm vào database

    res.redirect(`${systemConfig.prefixAdmin}/products`);
}


// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);

        const category = await ProductCategory.find({
            deleted: false
        });

        const newCategory = createTreeHelper.tree(category);

        res.render("admin/pages/products/edit", {
            pageTitle: "Chỉnh sửa sản phẩm",
            product: product,
            category: newCategory
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

}


// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);

    if (req.file) {
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }

    try {
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        }

        await Product.updateOne({
            _id: id
        }, {
            ...req.body,
            $push: {
                updatedBy: updatedBy
            }
        });
        req.flash("success", `Cập nhật thành công!`);
    } catch (error) {
        req.flash("error", `Cập nhật thất bại!`);
    }

    res.redirect("back");
}


// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);

        res.render("admin/pages/products/detail", {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

}