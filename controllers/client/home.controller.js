// [GET] /
module.exports.index = (req, res) => {
    res.render("client/pages/home/index.pug", {
        pageTitle: "Trang chủ"
    });
}


// hàm controller 
// module.exports.(tên file) = (req, res) => {
//     res.render("client/pages/home/index.pug");
// }