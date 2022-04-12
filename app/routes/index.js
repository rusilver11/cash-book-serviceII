import express from "express";
import { VerifyToken } from "../middlewares/jwt-auth.js";
import { RefreshToken } from "../controllers/auth.js";
import { getUsers, Login, VerifyOTP, Logout } from "../controllers/user.js";
import { SendOTP, ResendOTP } from "../middlewares/waotp.js";
import { GetAllBusinesscategory } from "../controllers/businesscategory.js";
import {
  GetBusinesses,
  GetAllBusinesses,
  AddBusinesses,
  EditBusinesses,
  DeleteBusinesses,
} from "../controllers/businesses.js";
import {
  GetAllProductcategory,
  GetProductcategory,
  GetAllProductsGroupByCategory,
  AddProductCategory,
  EditProductCategory,
  DeleteProductCategory,
} from "../controllers/productcategory.js";
import {
  GetAllProducts,
  GetProduct,
  AddProduct,
  EditProduct,
  DeleteProduct,
} from "../controllers/products.js";
import { GetAllContact, AddContact } from "../controllers/persons.js";
import {
  GetTransactionByDate,
  GetTransaction,
  AddTransaction,
  EditTransaction,
  DeleteTransaction,
} from "../controllers/transaction.js";
import {
  GetTransactionDetail,
  AddTransactionDetail,
  GrandTransactionDetail,
  EditTransactionDetail
} from "../controllers/transactiondetail.js";
import { GetBusinessApAr,AddBusinessApAr,EditBusinessApAr,DeleteBusinessApAr } from "../controllers/businessapar.js";
import { GetBusinessApArDetail,AddBusinessApArDetail } from "../controllers/businessapardetail.js";
import { GetHomeByDate,GetHome } from "../controllers/home.js";
const router = express.Router();

//home
router.get("/version", (req, res) =>
  res.status(200).send({ message: "Service Ready" })
);

//User Router
router.get("/users", VerifyToken, getUsers);
//sect login
router.post("/auth/login", Login, SendOTP);
router.post("/auth/login/otp", VerifyOTP);
router.post("/auth/login/resend-otp", ResendOTP);
router.post("/auth/token", RefreshToken);
router.delete("/auth/logout/:userid", Logout);
//sect home
router.get("/users/businesses/:businessid/home/:startdate/:enddate", VerifyToken, GetHomeByDate);
router.get("/users/businesses/:businessid/home", VerifyToken, GetHome);
//sect business category
router.get("/users/businesses/business-categories", VerifyToken, GetAllBusinesscategory);
//sect businesses
router.get("/users/businesses/:id", VerifyToken, GetBusinesses);
router.get("/users/:userid/businesses", VerifyToken, GetAllBusinesses);
router.post("/users/:userid/businesses", VerifyToken, AddBusinesses);
router.put("/users/businesses/:id", VerifyToken, EditBusinesses);
router.delete("/users/businesses/:id", VerifyToken, DeleteBusinesses);
//sect product category
router.get("/businesses/:businessid/product-categories", VerifyToken, GetAllProductcategory);
router.get("/businesses/:businessid/product-categories/:id", VerifyToken, GetProductcategory);
router.get("/businesses/:businessid/product-categories/products/:typeid", VerifyToken, GetAllProductsGroupByCategory);
router.post("/businesses/:businessid/product-categories", VerifyToken, AddProductCategory);
router.put("/businesses/:businessid/product-categories/:id", VerifyToken, EditProductCategory);
router.delete("/businesses/:businessid/product-categories/:id", VerifyToken, DeleteProductCategory);
//sect product
router.get("/businesses/:businessid/products/:typeid", VerifyToken, GetAllProducts);
router.get("/businesses/:businessid/products/:typeid/:id", VerifyToken, GetProduct);
router.post("/businesses/:businessid/products", VerifyToken, AddProduct);
router.put("/businesses/:businessid/products/:id", VerifyToken, EditProduct);
router.delete("/businesses/:businessid/products/:id", VerifyToken, DeleteProduct);
//sect persons
router.get("/users/:userid/persons", VerifyToken, GetAllContact);
router.post("/users/:userid/persons", VerifyToken, AddContact);
//sect Transactions
router.get("/businesses/:businessid/transactions/:startdate/:enddate", VerifyToken, GetTransactionByDate);
router.get("/businesses/:businessid/transactions/:id", VerifyToken, GetTransaction);
router.post("/businesses/:businessid/transactions", VerifyToken, AddTransaction);
router.put("/businesses/:businessid/transactions/:id", VerifyToken, EditTransaction);
router.delete("/businesses/:businessid/transactions/:id", VerifyToken, DeleteTransaction);
//sect TransactionDetail
router.get("/businesses/:businessid/transactions/:transactionid/detail/:typeid", VerifyToken, GetTransactionDetail);
router.post("/businesses/transactions/:transactionid/detail", VerifyToken, AddTransactionDetail);
router.post("/businesses/transactions/:transactionid/grand-detail", VerifyToken, GrandTransactionDetail);
router.patch("/businesses/transactions/:transactionid/detail", VerifyToken, EditTransactionDetail);
//sect BusinessApAr
router.get("/businesses/:businessid/businessapar", VerifyToken, GetBusinessApAr);
router.post("/businesses/:businessid/businessapar", VerifyToken, AddBusinessApAr);
router.put("/businesses/:businessid/businessapar/:id", VerifyToken, EditBusinessApAr);
router.delete("/businesses/:businessid/businessapar/:id", VerifyToken, DeleteBusinessApAr);
//sect BusinessApArDetail
router.get("/businesses/:businessid/businessapar/:businessaparid/detail", VerifyToken, GetBusinessApArDetail);
router.post("/businesses/businessapar/:businessaparid/detail", VerifyToken, AddBusinessApArDetail);

export default router;
