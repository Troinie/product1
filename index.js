const express = require('express');
//troinie

//  cài method-override
const methodOverride = require('method-override')

//  cài body-parser
const bodyParser = require('body-parser');

// cài flash
const flash = require("express-flash");

// cài cookieParser
const cookieParser = require("cookie-parser");

// cài session
const session = require("express-session");

const database = require("./config/database");

const systemConfig = require("./config/system");

//chạy env phải cài thư viện dotenv
require("dotenv").config();

const route = require("./routes/client/index.route");
const routeAdmin = require("./routes/admin/index.route");


database.connect();

const app = express();
const port = process.env.PORT;

app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({
    extended: false
}));

// flash
app.use(cookieParser("Troinie")); // phải cài thêm thư viện npm i cookie-parser
app.use(session({ // phải cài thêm thư viện npm i express-session
    cookie: {
        maxAge: 60000
    }
}));
app.use(flash());

// cài pug
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');


// app locals (biến toàn cục)
app.locals.prefixAdmin = systemConfig.prefixAdmin;


// bootstrap
app.use(express.static(`${__dirname}/public`));


// route
route(app);
routeAdmin(app);


app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})