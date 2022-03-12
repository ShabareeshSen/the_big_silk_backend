import storage from "./firebaseSetup";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
require("dotenv").config();
import jwt from "jsonwebtoken";
const Pool = require("pg").Pool;


const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "thebigsilk",
  password: "root",
  port: 5432,
});
let refreshTokens = [];
const createTabel = (request, response) => {
  pool.query(
    "CREATE TABLE userInfo (ID int SERIAL PRIMARY KEY,  FirstName varchar(255) NOT NULL,LastName varchar(255) ,Email varchar(100) NOT NULL, Phone int NOT NULL,  Address varchar(255),  City varchar(255))",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getAllUsers = (request, response) => {
  pool.query("SELECT * FROM userInfo", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const token= (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
};

const logOut = (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
};

const login = (request, response) => {
  const { email, password } = request.body;
  pool.query(
    "SELECT * FROM userInfo where email= $1 and password = $2",
    [email, password],
    (error, results) => {
      if (error) {
        throw error;
      }
      console.log(results.rows[0]);
      if (results.rows.length > 0) {
        const name = results.rows[0]?.firstname;
        const userId = results.rows[0]?.id;
        // const email = results.rows[0]?.email;
        const accessToken = jwt.sign(
          { userId, name, email },
          "lkfhjl45645ngdh%&^%$#@ghkg",
          {
            expiresIn: "15s",
          }
        );
        const refreshToken = jwt.sign({ userId, name, email }, "lkfh46546546lghkg", {
          expiresIn: "1d",
        });
        // await Users.update(
        //   { refresh_token: refreshToken },
        //   {
        //     where: {
        //       email: userId,
        //     },
        //   }
        // );
        // response.status(200).json({
        //   token: accessToken,
        //   msg: "login SuccessFull",
        //   user: results.rows,
        // });
        refreshTokens.push(refreshToken);
        res.json({ accessToken: accessToken, refreshToken: refreshToken });
      } else {
        response.status(403).json("Incorrect username or password");
      }
    }
  );
};

const createUser = (request, response) => {
  const {
    firstname,
    lastname,
    email,
    phone,
    address,
    state,
    city,
    password,
    pincode,
  } = request.body;

  pool.query(
    "INSERT INTO userInfo (firstname , lastname , email , phone , address ,state, city,password,pincode ) VALUES ($1, $2, $3, $4, $5, $6,$7,$8,$9)",
    [
      firstname,
      lastname,
      email,
      phone,
      address,
      state,
      city,
      password,
      pincode,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`User added`);
    }
  );
};

const addProduct = async (request, response) => {
  const {
    product_name,
    no_of_stars,
    no_of_review,
    editors_notes,
    good_to_know,
    is_available,
    care_instruction,
    rate,
    rate2,
    category,
    main_pictue,
    sub_picture,
    color_picture,
    quantity,
  } = request.body;

  console.log(sub_picture);

  pool.query(
    "INSERT INTO productinfo ( product_name , no_of_stars , no_of_review , editors_notes , good_to_know , is_available , care_instruction , rate , rate2, category,main_pictue, sub_picture,color_picture,quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,ARRAY[$12],Array[$13],$14)",
    [
      product_name,
      no_of_stars,
      no_of_review,
      editors_notes,
      good_to_know,
      is_available,
      care_instruction,
      rate,
      rate2,
      category,
      main_pictue,
      sub_picture,
      color_picture,
      quantity,
    ],
    (error, results) => {
      if (error) {
        console.log(error);
        throw error;
      }
      response.status(201).send(`Product added`);
    }
  );
};
const getAllProducts = (request, response) => {
  pool.query("SELECT * FROM productinfo", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const deleteProducts = (request, response) => {
  const { id } = request.body;
  pool.query("DELETE FROM  productinfo WHERE id=$1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getProductsByCategory = (request, response) => {
  const { category } = request.body;
  console.log(category);
  pool.query(
    "SELECT * FROM productinfo WHERE category= $1",
    [category],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

//Category -add
const createCategory = (request, response) => {
  const { category, description } = request.body;
  console.log(request.body);
  pool.query(
    "INSERT INTO category (category,description ) VALUES ($1, $2)",
    [category, description],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Category added`);
    }
  );
};

//promoCode-add
const createPromoCode = (request, response) => {
  const {
    code,
    from_date,
    to_date,
    category,
    min_amount,
    max_amount,
    reduce_by,
    amount,
    percentage,
  } = request.body;

  pool.query(
    "INSERT INTO promocode (code, from_date,to_date,category,min_amount,max_amount,reduce_by,amount,percentage) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
    [
      code,
      from_date,
      to_date,
      category,
      min_amount,
      max_amount,
      reduce_by,
      amount,
      percentage,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`PromoCode added`);
    }
  );
};

module.exports = {
  getAllUsers,
  createUser,
  addProduct,
  getAllProducts,
  getProductsByCategory,
  deleteProducts,
  createCategory,
  createPromoCode,
  login,token,logOut
};
