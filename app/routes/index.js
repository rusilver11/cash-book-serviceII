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
  EditTransactionDetail,
  DeleteTransactionDetail,
} from "../controllers/transactiondetail.js";
import { AddBusinessApAr,EditBusinessApAr,DeletedBusinessApAr } from "../controllers/businessapar.js";

const router = express.Router();

//home
router.get("/api/version", (req, res) =>
  res.status(200).send({ message: "Service Ready" })
);

//User Router
router.get("/api/users", VerifyToken, getUsers);
//sect login
router.post("/api/login", Login, SendOTP);
router.post("/api/otp", VerifyOTP);
router.post("/api/resend-otp", ResendOTP);
router.get("/api/token", RefreshToken);
router.delete("/api/logout", Logout);
//sect business category
router.get("/api/business-category", GetAllBusinesscategory);
//sect businesses
router.get("/api/businesses/detail/:id", GetBusinesses);
router.get("/api/businesses/:id", GetAllBusinesses);
router.post("/api/businesses", AddBusinesses);
router.patch("/api/businesses/:id", EditBusinesses);
router.delete("/api/businesses/:id", DeleteBusinesses);
//sect product category
router.get("/api/product-category/:id", GetAllProductcategory);
router.get("/api/product-category/:businessid/:id", GetProductcategory);
router.get( "/api/product-category/products/:businessid/:typeid", GetAllProductsGroupByCategory);
router.post("/api/product-category", AddProductCategory);
router.patch("/api/product-category/:businessid/:id", EditProductCategory);
router.delete("/api/product-category/:businessid/:id", DeleteProductCategory);
//sect product
router.get("/api/products/:businessid/:typeid", GetAllProducts);
router.get("/api/products/:businessid/:typeid/:id", GetProduct);
router.post("/api/products", AddProduct);
router.patch("/api/products/:businessid/:id", EditProduct);
router.delete("/api/products/:businessid/:id", DeleteProduct);
//sect persons
router.get("/api/persons/:userid", GetAllContact);
router.post("/api/persons", AddContact);
//sect Transactions
router.get("/api/transaction/:businessid/:startdate/:enddate", GetTransactionByDate);
router.get("/api/transaction/:businessid/:id", GetTransaction);
router.post("/api/transaction", AddTransaction);
router.patch("/api/transaction/:businessid/:id", EditTransaction);
router.delete("/api/transaction/:businessid/:id", DeleteTransaction);
//sect TransactionDetail
router.get("/api/transaction-detail/:businessid/:typeid/:transactionid",GetTransactionDetail);
router.post("/api/transaction-detail/:transactionid", AddTransactionDetail);
router.patch("/api/transaction-detail/:transactionid", EditTransactionDetail);
router.delete("/api/transaction-detail/:transactionid",DeleteTransactionDetail);
//sect BusinessApAr
router.post("/api/businessapar", AddBusinessApAr);
router.patch("/api/businessapar/:businessid/:businessaparid", EditBusinessApAr);
router.delete("/api/businessapar/:businessid/:businessaparid", EditBusinessApAr);

export default router;
