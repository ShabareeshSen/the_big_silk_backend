require("dotenv").config();
const { response } = require("express");
const { json } = require("express/lib/response");
const jwt = require("jsonwebtoken");
const Pool = require("pg").Pool;

const pool = new Pool({
  user: "murjxoshalbmbr",
  host: "ec2-44-195-201-3.compute-1.amazonaws.com",
  database: "d1ms6amnr4gl8",
  password: "c52bd6b6636118a252c0400d4942fc8e09cad2b62866481014774b16050a9055",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});
let refreshTokens = [];
const createTabel = (request, response) => {
  pool.query(
    "CREATE TABLE userInfo (ID int SERIAL PRIMARY KEY,  FirstName varchar(255) NOT NULL,LastName varchar(255) ,Email varchar(100) NOT NULL, Phone int NOT NULL,  Address varchar(255),  City varchar(255))",
    (error, results) => {
      if (error) {
        response.status(200).json({ msg: "", err: error });
      }
      response.status(200).json(results.rows);
    }
  );
};

const getAllUsers = (request, response) => {
  pool.query("SELECT * FROM userInfo", (error, results) => {
    if (error) {
      response.status(200).json({ msg: "", err: error });
    }
    response.status(200).json(results.rows);
  });
};

const token = (req, res) => {
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
  console.log(req);
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
        response.status(200).json({ msg: "", err: error });
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
        const refreshToken = jwt.sign(
          { userId, name, email },
          "lkfh46546546lghkg",
          {
            expiresIn: "1d",
          }
        );
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
        response.json({ accessToken: accessToken, refreshToken: refreshToken });
      } else {
        response.status(403).json("Incorrect username or password");
      }
    }
  );
};

async function verifyAccessToken(req, res, next) {
  try {
    const authToken = req.headers.authorization;
    if (!authToken) throw { isError: true, message: "No auth token provided!" };

    const accessToken = authToken.split(" ")[1];
    if (!accessToken)
      throw { isError: true, message: "No auth token provided!" };

    const payload = await jwt.verifyAccessToken(accessToken);
    await checkIfAllowed(payload.aud);
    req.payload = payload;
    next();
  } catch (err) {
    next(err);
  }
}

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

  //check user
  pool.query(
    "SELECT * FROM userInfo where email=$1",
    [email],
    (error, results) => {
      if (error) {
        response.status(200).json({ msg: "", err: error });
      }

      if (results.rows.length > 0) {
        response.status(200).json({ msg: "", err: "Email already exist" });
      } else {
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
              response.status(200).json({ msg: "", err: error });
            }
            response.status(201).send({
              msg: "Account Created sucessfully - Login To Continue",
              err: "",
            });
          }
        );
      }
    }
  );
};
//update user-----------------------update user------------------------------------------------------------------------
const updateUser = (request, response) => {
  const {
    firstname,
    lastname,
    phone,
    address,
    state,
    city,
    pincode,
    id
  } = request.body;

  //check user
  pool.query(
    "SELECT * from userInfo where id=$1",
    [id],
    (error, results) => {
      if (error) {
        response.status(200).json({ msg: "", err: error });
      }

      if (results.rows.length < 0) {
        response.status(200).json({ msg: "", err: "User not found" });
      } else {
        pool.query(
          "UPDATE userInfo SET firstname=$1,lastname=$2,phone=$3,address=$4,state=$5,city=$6,pincode=$7, where id=$8",
          [
            firstname,
            lastname,
            phone,
            address,
            state,
            city,
            pincode,
            id
          ],
          (error, results) => {
            if (error) {
              response.status(200).json({ msg: "", err: "Unable to update the user info - please try after some time" });
            }
            response.status(201).send({
              msg: "User updated Succesfully",
              err: "",
            });
          }
        );
      }
    }
  );
};
//---------------------------------------------------------------------------------------------------------------------

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
  console.log(request.body);
  pool.query(
    "SELECT * FROM productinfo where product_name=$1",
    [product_name],
    (error, results) => {
      if (error) {
       response.status(200).json({ msg: "", err: "unable to oad products" });
      }
      if (results.rows.length > 0) {
        response.status(200).json({ msg: "", err: "Product already exist" });
      } else {
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
              response
                .status(200)
                .json({ msg: "", err: "Unabel to add Product" });
            }
            response
              .status(200)
              .json({ msg: "Product added Succesfully", err: "" });
          }
        );
      }
    }
  );
};
const getAllProducts = (request, response) => {
  pool.query("SELECT * FROM productinfo", (error, results) => {
    if (error) {
      response.status(200).json({ msg: "", err: error });
    }
    response.status(200).json(results.rows);
  });
};

const getAllCategory = (request, response) => {
  pool.query("SELECT * FROM category", (error, results) => {
    if (error) {
      response.status(200).json({ msg: "", err: error });
    }
    response.status(200).json(results.rows);
  });
};
const getAllProductsDefinedByCategory = (request, response) => {
  pool.query("SELECT * FROM category", (error, results) => {
    if (error) {
      response.status(200).json({ msg: "", err: "Error on Category" });
    }
    if (results.rows.length > 0) {
      let cats = [];
      var finail = [];
      results.rows.map((e) => {
        cats.push(e.category);
      });

      var init = [];
      cats.map((e) => {
        console.log(e);
        var con = pool.query(
          "SELECT * FROM productinfo WHERE category= $1",
          [e],
          (error, results) => {
            if (error) {
              response.status(200).json({
                msg: "",
                err: "Error on mapping category with product",
              });
            }
            let obj = {};
            if (results.rows.length > 0) {
              let current = results.rows;
              obj = {
                category: e,
                products: current,
              };
            } else {
              let current = [];
              obj = {
                category: e,
                products: current,
              };
            }
            finail.push(obj);
            if (finail.length === cats.length) {
              response.status(200).json(finail);
            }
          }
        );
      });
    }
  });
};
// delete product--------------------------delete product-----------------------------------------

const deleteProducts = (request, response) => {
  const { id } = request.body;
  pool.query("DELETE FROM  productinfo WHERE id=$1", [id], (error, results) => {
    if (error) {
      response.status(200).json({ msg: "", err: "Failed to Delete Products" });
    }
    response.status(200).json({ msg: "Product has been deleted Succesfully", err: "" });
  });
};
//-----------------------------------------------------------------------------------------------

//update product --------------------------- product update --------------------------------------

const updateProduct = async (request, response) => {
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
    quantity,
    id
  } = request.body;
  pool.query(
    "SELECT * FROM productinfo where id=$1",
    [id],
    (error, results) => {
      if (error) {
         response.status(200).json({ msg: "", err: "unable to oad products" });
      }
      if (results.rows.length < 0) {
        response.status(200).json({ msg: "", err: "Product does not exist" });
      } else {
        pool.query(
         "UPDATE productinfo SET product_name =$1,no_of_stars=$2,no_of_review =$3,editors_notes=$4,good_to_know =$5,is_available=$6 ,care_instruction =$7,rate =$8,rate2=$9,category=$10,quantity=$11 WHERE id=$12"
         ,[
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
            quantity,
            id
          ],
          (error, results) => {
            if (error) {
              response
                .status(200)
                .json({ msg: "", err: "Unabel to add Product" });
            }
            response
              .status(200)
              .json({ msg: "Product Updated Succesfully", err: "" });
          }
        );
      }
    }
  );
};

//-------------------------------------------------------------------------------------------------

const selectProducts = (request, response) => {
  const { id } = request.body;
  pool.query(
    "select * FROM  productinfo WHERE id=$1",
    [id],
    (error, results) => {
      if (error) {
        response.status(200).json({ msg: "", err: error });
      }
      if (results.rows.length > 0) {
        response.status(200).json(results.rows);
      } else {
        response.status(200).json({ msg: "", err: "Product not found" });
      }
    }
  );
};

const getProductsByCategory = (request, response) => {
  const { category } = request.body;
  console.log(category);
  pool.query(
    "SELECT * FROM productinfo WHERE category= $1",
    [category],
    (error, results) => {
      if (error) {
        response.status(200).json({ msg: "", err: error });
      }
      response.status(200).json(results.rows);
    }
  );
};

//Category -add
const createCategory = (request, response) => {
  const { category, description } = request.body;
  pool.query(
    "SELECT * FROM category where category= $1",
    [category.toLowerCase()],
    (error, results) => {
      if (error) {
        response.status(200).json({ msg: "", err: error });
      }
      if (results.rows.length > 0) {
        response.status(200).json({ msg: "", err: "Category already exist" });
      } else {
        pool.query(
          "INSERT INTO category (category,description ) VALUES ($1, $2)",
          [category.toLowerCase(), description],
          (error, results) => {
            if (error) {
              response.status(200).json({ msg: "", err: error });
            }
            response
              .status(200)
              .json({ msg: "Category Added Succesfully", err: "" });
          }
        );
      }
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
        response.status(200).json({ msg: "", err: error });
      }
      response.status(201).send(`PromoCode added`);
    }
  );
};

//add to cart
const addToCart = (request, response) => {
  // console.log(request.body);
  const { userId, productId, quantity } = request.body;
  var product;
  var user = [];
  var cart;
  var UpdateCart;
  pool.query(
    "select * FROM  productinfo WHERE id=$1",
    [productId],
    (error, results) => {
      if (error) {
        response
          .status(200)
          .json({ msg: "", err: "Unable fetch the Product Details" });
      }
      //check for product
      if (results.rows.length > 0) {
        product = results.rows;
        pool.query(
          "SELECT * FROM userInfo where id=$1",
          [userId],
          async (error, results) => {
            if (error) {
              response
                .status(200)
                .json({ msg: "", err: "Unable toFetch User Details" });
            }
            if (results.rows.length > 0) {
              // user is cart details
              user = results.rows[0].cart;
              //new product is set in object to be pushed to array
              let obj1 = {
                productId: productId,
                quantity: quantity,
              };
              let obj = JSON.stringify(obj1);
              //check if cart is empty
              if (user) {
                // to remove " on the string from DB
                let b = await user.slice(1, -1);
                var aro = JSON.parse(b);
                var indexToRemove;
                // find if product already in list
                let duplicateCheck = aro.filter((e, index) => {
                  if (e.productId === productId) {
                    // set the index of found duplicate product
                    indexToRemove = index;
                    return e;
                  }
                });
                //Check for already entered product
                if (duplicateCheck.length > 0) {
                  // remove if already exist
                  await aro.splice(indexToRemove, 1);
                  //adding same product with quantity change -- new obj
                  let finalObj = {
                    productId: duplicateCheck[0]["productId"],
                    quantity: duplicateCheck[0]["quantity"] + quantity,
                  };
                  //pushing the obj
                  aro.push(finalObj);
                } else {
                  aro.push(JSON.parse(obj));
                }
                //adding the array of obj to cart
                cart = '"' + JSON.stringify(aro) + '"';
              } else {
                //if cart is emty we can add the product obj directly
                cart = '" [' + obj + '] "';
              }

              // addCartAmount(aro);
              // console.log(k,"retyren");
              pool.query(
                "UPDATE userInfo SET cart = $1 WHERE id=$2",
                [cart, userId],
                (error, results) => {
                  if (error) {
                    response.status(200).json({
                      msg: "",
                      err: "Unable to update cart User Details",
                    });
                  }
                }
              );
              //SELECT rate FROM productinfo WHERE id=$1",[product.productId]

              //retruning success msg

              response
                .status(200)
                .json({ msg: "Product Added To the Cart", err: "" });
            } else {
              response.status(200).json({ msg: "", err: "User not found" });
            }
            //  console.log(user)
          }
        );
      } else {
        response.status(200).json({ msg: "", err: "Product not found" });
      }
    }
  );
};
//Add amount
const addCartAmount = async (cart) => {
  const adder = async (cart) => {
    var a = 0;
    var b = 0;
    var ratearr = [];
    var qarr = [];
    cart.map((e) => {
      pool.query(
        "select rate FROM  productinfo WHERE id=$1",
        [e.productId],
        async (error, results) => {
          if (error) {
            response.status(200).json({
              msg: "",
              err: "Unable fetch the product rate from product",
            });
          }

          if (results.rows[0].rate) {
            ratearr.push(parseFloat(results.rows[0].rate));
            qarr.push(parseFloat(e.quantity));
            // a = a + parseFloat(results.rows[0].rate) * parseFloat(e.quantity);
            // console.log(a, "to");
            // if (a!=undefined) {
            //   console.log(a, "out");
            //   return a;
            // }
          }
        }
      );
    });
  };

  const totalCalculation = (rates, quantity) => {
    let aaar;
    if (rates) {
      aaar = aaar + parseFloat(rates) * parseFloat(quantity);
      console.log(aaar, "to");
      if (aaar != undefined) {
        console.log(a, "out");
        return a;
      }
    }
  };

  adder(cart).then((e) => {
    console.log(e, "fin");
  });
  // if(total!==0 || total!=undefined ||total!==null){
  //   console.log(total,"out11")
  //   return total
  // }
};

//update cart ------------------------------------------------ ----------- --------------------
const updateCart = async (request, response) => {
  const { userId, productId, quantity, operation } = request.body;
  //fetching the cart from user tabel
  var user;
  //
  pool.query(
    "select * FROM  productinfo WHERE id=$1",
    [productId],
    (error, results) => {
      if (error) {
        response
          .status(200)
          .json({ msg: "", err: "Unable fetch the Product Details" });
      }
      //check for product
      if (results.rows.length > 0) {
        pool.query(
          "select cart FROM  userinfo WHERE id=$1",
          [userId],
          async (error, results) => {
            if (error) {
              response.status(200).json({
                msg: "",
                err: "Unable fetch the cart from user with param",
              });
            }
            // check if cart not null
            if (results.rows[0].cart) {
              user = results.rows[0].cart;
              if (user) {
              }
              let b = await user.slice(1, -1);
              var cartFromUser = JSON.parse(b);

              // Check if the opertaion is to remove product from cart
              if (operation === "REMOVE" || quantity === 0) {
                cartFromUser.splice(
                  cartFromUser.findIndex(
                    (elem) => elem.productId === productId
                  ),
                  1
                );
              } else if (operation === "UPDATE_QUANTITY" && quantity !== 0) {
                //remove the item from cart
                cartFromUser.splice(
                  cartFromUser.findIndex(
                    (elem) => elem.productId === productId
                  ),
                  1
                );
                //adding the product with new quantity
                let obj = {
                  productId: productId,
                  quantity: quantity,
                };
                cartFromUser.push(obj);
              }
              // convertion to string
              var cart;
              if (cartFromUser.length > 0) {
                cart = '"' + JSON.stringify(cartFromUser) + '"';
              } else {
                cart = "";
              }

              //updating in to db

              pool.query(
                "UPDATE userInfo SET cart = $1 WHERE id=$2",
                [cart, userId],
                (error, results) => {
                  if (error) {
                    response.status(200).json({
                      msg: "",
                      err: "Unable to update cart User Details",
                    });
                  }
                }
              );
              //Sending response
              response.status(200).json({ msg: "Cart Updated", err: "" });
            } else {
              response.status(200).json({ msg: "", err: "User cart is empty" });
            }
          }
        );
      } else {
        response.status(200).json({ msg: "", err: "Product not found" });
      }
    }
  );
  //
};

//getCart-------------------------------------------------------------
const getCartById = async (request, response) => {
  const { id } = request.body;
  var cart;
  pool.query(
    "select cart FROM  userinfo WHERE id=$1",
    [id],
    async (error, results) => {
      if (error) {
        response
          .status(200)
          .json({ msg: "", err: "Unable fetch the cart from user with param" });
      } else if (results.rows.length > 0) {
        cart = results.rows[0].cart;
        if (cart) {
          let a = JSON.parse(JSON.stringify(cart));
          let b = a.slice(1, -1);
          if (b) {
            var aro = JSON.parse(b);
            // console.log(aro);
            let amt = 0;
            let final = [];
            const myPromise = new Promise((resolve, reject) => {
              aro.map(async (e) => {
                pool.query(
                  "select * FROM  productinfo WHERE id=$1",
                  [e.productId],
                  async (error, results) => {
                    if (error) {
                      response.status(200).json({
                        msg: "",
                        err: "Unable fetch the Product Details",
                      });
                    }
                    if (results.rows.length > 0) {
                      let prod = await results.rows[0];
                      let val = (await prod.rate) * e.quantity;
                      amt = amt + val;
                      let obj = {
                        productId: e.productId,
                        quantity:e.quantity,
                        productDetails: prod,
                        total: val,
                      };
                      // console.log(obj)
                      final.push(obj);
                    }
                  }
                );
                setTimeout(() => {
                  let obj1 = {
                    subTotal: amt,
                    productInfo: JSON.parse(JSON.stringify(final)),
                  };
                  resolve(obj1);
                }, 3000);
              });
            });
            myPromise.then((e) => {
              // console.log(e, "log");
              response.status(200).json(e);
            });

            // if(final.length!==0){
            //   console.log(final);
            // }
            // let onj1={
            //   cartDetail:final
            // }
            // console.log()
            // response.status(200).json(aro);
          }
        } else {
          response.status(200).json({ msg: "", err: "Cart is empty" });
        }
      } else {
        response
          .status(200)
          .json({ msg: "", err: "Unable fetch the cart from user" });
      }
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
  login,
  token,
  logOut,
  getAllCategory,
  getAllProductsDefinedByCategory,
  selectProducts,
  addToCart,
  getCartById,
  updateCart,
  updateProduct,
  updateUser,
};
