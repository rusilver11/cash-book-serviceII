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
import { GetBusinessApAr,AddBusinessApAr,EditBusinessApAr,DeleteBusinessApAr } from "../controllers/businessapar.js";
import { GetBusinessApArDetail,AddBusinessApArDetail } from "../controllers/businessapardetail.js";
const router = express.Router();

//home
router.get("/api/version", (req, res) =>
  res.status(200).send({ message: "Service Ready" })
);

//User Router
router.get("/api/users", VerifyToken, getUsers);
//sect login
router.post("/api/login", Login, SendOTP);
router.post("/api/login/otp", VerifyOTP);
router.post("/api/login/resend-otp", ResendOTP);
router.get("/api/login/token", RefreshToken);
router.delete("/api/users/logout", Logout);
//sect business category
router.get("/api/users/businesses/business-categories", GetAllBusinesscategory);
//sect businesses
router.get("/api/users/businesses/:id", GetBusinesses);
router.get("/api/users/:userid/businesses", GetAllBusinesses);
router.post("/api/users/businesses", AddBusinesses);
router.patch("/api/users/businesses/:id", EditBusinesses);
router.delete("/api/users/businesses/:id", DeleteBusinesses);
//sect product category
router.get("/api/businesses/:businessid/product-categories", GetAllProductcategory);
router.get("/api/businesses/:businessid/product-categories/:id", GetProductcategory);
router.get("/api/businesses/:businessid/product-categories/products/:typeid", GetAllProductsGroupByCategory);
router.post("/api/businesses/product-categories", AddProductCategory);
router.patch("/api/businesses/:businessid/product-categories/:id", EditProductCategory);
router.delete("/api/businesses/:businessid/product-categories/:id", DeleteProductCategory);
//sect product
router.get("/api/businesses/:businessid/products/:typeid", GetAllProducts);
router.get("/api/businesses/:businessid/products/:typeid/:id", GetProduct);
router.post("/api/businesses/products", AddProduct);
router.patch("/api/businesses/:businessid/products/:id", EditProduct);
router.delete("/api/businesses/:businessid/products/:id", DeleteProduct);
//sect persons
router.get("/api/users/:userid/persons", GetAllContact);
router.post("/api/users/persons", AddContact);
//sect Transactions
router.get("/api/businesses/:businessid/transactions/:startdate/:enddate", GetTransactionByDate);
router.get("/api/businesses/:businessid/transactions/:id", GetTransaction);
router.post("/api/businesses/transactions", AddTransaction);
router.patch("/api/businesses/:businessid/transactions/:id", EditTransaction);
router.delete("/api/businesses/:businessid/transactions/:id", DeleteTransaction);
//sect TransactionDetail
router.get("/api/businesses/:businessid/transactions/:transactionid/detail/:typeid",GetTransactionDetail);
router.post("/api/businesses/transactions/:transactionid/detail", AddTransactionDetail);
router.patch("/api/businesses/transactions/:transactionid/detail", EditTransactionDetail);
router.delete("/api/businesses/transactions/:transactionid/detail",DeleteTransactionDetail);
//sect BusinessApAr
router.get("/api/businesses/:businessid/businessapar",GetBusinessApAr);
router.post("/api/businesses/businessapar", AddBusinessApAr);
router.patch("/api/businesses/:businessid/businessapar/:businessaparid", EditBusinessApAr);
router.delete("/api/businesses/:businessid/businessapar/:businessaparid", DeleteBusinessApAr);
//sect BusinessApArDetail
router.get("/api/businesses/:businessid/businessapar/:businessaparid/detail",GetBusinessApArDetail);
router.post("/api/businesses/businessapar/:businessaparid/detail",AddBusinessApArDetail);

export default router;
