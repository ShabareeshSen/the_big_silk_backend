const express = require("express");
const bodyParser = require("body-parser");
const db = require("./quries");
import cors from "cors";

const app = express();
const port = 5000;
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

app.listen(port),
  () => {
    console.log(`Server Started ${port}`);
  };
