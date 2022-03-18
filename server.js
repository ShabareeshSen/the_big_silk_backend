const express = require("express");
const bodyParser = require("body-parser");
const db = require("./quries");
var cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.post("/users", db.createUser);
app.get("/users", db.getAllUsers);
app.post("/login", db.login);
app.post("/token", db.token);
// app.delete("/logout", db.logout);
app.post("/products", db.addProduct);

app.get("/products", db.getAllProducts);
app.get("/productsCategory", db.getProductsByCategory);
app.post("/deleteProduct", db.deleteProducts);

app.post("/category", db.createCategory);
app.post("/promoCode", db.createPromoCode);
app.get("/category", db.getAllCategory);
app.get("/productCat", db.getAllProductsDefinedByCategory);
app.post("/productById", db.selectProducts);
app.post("/addToCart", db.addToCart);
app.post("/getCart", db.getCartById);
app.post("/updateCart", db.updateCart);
//updateCart

app.listen(port);
