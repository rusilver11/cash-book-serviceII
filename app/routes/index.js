import express from "express";
import {VerifyToken} from "../middlewares/jwt-auth.js"
import {RefreshToken} from "../controllers/auth.js"
import {getUsers,Login,VerifyOTP,Logout} from "../controllers/user.js";
import {SendOTP,ResendOTP} from "../middlewares/waotp.js"
import { Businesscategory } from "../controllers/businesscategory.js";
import { GetBusinesses,GetAllBusinesses,AddBusinesses,EditBusinesses,DeleteBusinesses } from "../controllers/businesses.js";


const router = express.Router();

//home
router.get("/api/version", (req,res) => res.status(200).send({message: "Service Ready"}));

//User Router
router.get("/api/users",VerifyToken,getUsers);
//sect login
router.post("/api/login",Login,SendOTP);
router.post("/api/otp",VerifyOTP);
router.post("/api/resend-otp", ResendOTP);
router.get("/api/token", RefreshToken);
router.delete("/api/logout", Logout);
//sect businesses
router.get("/api/business-category",Businesscategory);
router.get("/api/businesses/detail/:id", GetBusinesses);
router.get("/api/businesses/:id", GetAllBusinesses);
router.post("/api/businesses", AddBusinesses);
router.patch("/api/businesses/:id", EditBusinesses);
router.delete("/api/businesses/:id", DeleteBusinesses);

export default router