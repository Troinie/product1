const systemConfig = require("../../config/system");

const dashboardRoutes = require("./dashboard.route");

const productRoutes = require("./product.route");

const roleRoutes = require("./role.route");

const productCategorys= require("./product-category.route");

module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin;

    app.use(PATH_ADMIN + '/dashboard', dashboardRoutes);

    app.use(PATH_ADMIN + '/products', productRoutes);

    app.use(PATH_ADMIN + '/products-category', productCategorys);

    app.use(PATH_ADMIN + '/roles', roleRoutes);
}