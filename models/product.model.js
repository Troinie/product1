const mongoose = require("mongoose");

// cài slug
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const productSchema = new mongoose.Schema({
    title: String,
    // product_category_id: {
    //     type: String,
    //     default: ""
    // },
    description: String,
    price: Number,
    discountPercentage: Number,
    stock: Number,
    thumbnail: String,
    status: String,
    position: Number,
    slug: { 
        type: String, 
        slug: "title",
        unique: true // duy nhất
    },
    deleted: {
        type: Boolean,
        default: false // người dùng k truyền vào thì mặc định là false
    },
    deleteAt: Date
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema, "products");
// products là tên colection trong database

module.exports = Product;