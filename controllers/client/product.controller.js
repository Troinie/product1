const Product = require("../../models/product.model");

const ProductsCategory = require("../../models/product-category.model");

const productsHelper = require("../../helpers/product")

const producCategorytsHelper = require("../../helpers/products-category");
 
// [GET] /products
module.exports.index = async (req, res) => {
    const products = await Product.find({
        status: "active",
        deleted: false
    }).sort({
        position: "desc"
    });

    const newProducts = productsHelper.priceNewProducts(products);

    res.render("client/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        products: newProducts
    });
}


// [GET] /products/detail/:slugProduct
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            slug: req.params.slugProduct,
            status: "active"
        };
        console.log(req.params.id)

        const product = await Product.findOne(find);

        if(product.product_category_id){
            const category = await ProductsCategory.findOne({
                _id: product.product_category_id,
                status: "active",
                deleted: false
            });

            product.category = category;
        }

        product.priceNew = productsHelper.priceNewProduct(product);

        res.render("client/pages/products/detail", {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`/products`);
    }
}


// [GET] /products/:slugCategory
module.exports.category = async (req, res) => {
    const category = await ProductsCategory.findOne({
        slug: req.params.slugCategory,
        status: "active",
        deleted: false
    });

    const listSubCategory = await producCategorytsHelper.getSubCategory(category.id);

    const listSubCategoryId = listSubCategory.map(item => item.id);
    

    const products = await Product.find({
        product_category_id: { $in: [category.id, ...listSubCategoryId] },
        deleted: false
    }).sort({ position: "desc" });

    const newProducts = productsHelper.priceNewProducts(products);

    res.render("client/pages/products/index", {
        pageTitle: category.title,
        products: newProducts
    });
}