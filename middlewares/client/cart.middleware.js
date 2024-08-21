const Cart = require("../../models/cart.model");

module.exports.cartId = async (req, res, next) => {
    // console.log("luôn chạy vào đây");
    if (!req.cookies.cartId) {
        const cart = new Cart();
        await cart.save();

        // thời gian lưu giỏ hàng
        const expiresTime = 1000 * 60 * 24 * 365;

        res.cookie("cartId", cart.id, {
            expires: new Date(Date.now() + expiresTime)
        });
    } else {
        // khi đã có giỏ hàng
        const cart = await Cart.findOne({
            _id: req.cookies.cartId
        });

        cart.totalQuantity = cart.products.reduce((sum, itme) => sum + itme.quantity, 0);

        res.locals.miniCart = cart;
    }

    next();
};