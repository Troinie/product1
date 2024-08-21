const Product = require("../../models/product.model");

const productsHelper = require("../../helpers/product");

// [GET] /
module.exports.index = async (req, res) => {
    // lấy ra sản phẩm nổi bật
    const productsFeatured = await Product.find({
        featured: "1",
        deleted: false,
        status: "active"
    }).limit(5);

    const newProductsFeatured = productsHelper.priceNewProducts(productsFeatured);   

    // lấy ra sản phẩm mới nhất
    const productsNew = await Product.find({
        deleted: false,
        status: "active"
    }).sort({ position: "desc" }).limit(5);

    const newProductsNew = productsHelper.priceNewProducts(productsNew);   


    res.render("client/pages/home/index.pug", {
        pageTitle: "Trang chủ",
        productsFeatured: newProductsFeatured,
        productsNew: newProductsNew
    });
}



// hàm controller 
// module.exports.(tên file) = (req, res) => {
//     res.render("client/pages/home/index.pug");
// }