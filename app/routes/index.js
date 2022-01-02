import express from "express";
import {VerifyToken} from "../middlewares/jwt-auth.js"
import {RefreshToken} from "../controllers/auth.js"
import {getUsers,Login,VerifyOTP,Logout} from "../controllers/user.js";
import {SendOTP,ResendOTP} from "../middlewares/waotp.js"


const router = express.Router();

//home
router.get("/api/version", (res) => res.status(200).send({message: "Service Ready"}));

//User Router
router.get("/api/users", VerifyToken,getUsers);
router.post("/api/login",Login,SendOTP);
router.post("/api/otp",VerifyOTP);
router.post("/api/resend-otp", ResendOTP);
router.get("/api/token", RefreshToken);
router.delete("/api/logout", Logout);

export default router