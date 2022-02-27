import Users from "../models/users.js";
import jwt from "jsonwebtoken";
import Sequelize from "sequelize";
const Op = Sequelize.Op;

export const RefreshToken = async(req, res) => {
    try {
        const RefreshToken = req.body.refreshToken;
        if(!RefreshToken){
            return res.status(401).send({message:"Invalid token"});
        } 
        const User = await Users.findOne({
            where:{
                RefreshToken:{[Op.eq]:RefreshToken}
            }
        });
        if(!User){
            return res.status(404).send({message:"Token doesn't exist"});
        } 
        jwt.verify(RefreshToken, `${process.env.REFRESH_TOKEN_SECRET}`, (err, decoded) => {
            if(err){
                return res.status(403).send({message:"Refresh token expired"});
            } 
            const UserId = User.Id;
            const Phone = User.Phone;
            const Otp = User.OTP;
            const accessToken = jwt.sign({UserId,Phone,Otp}, `${process.env.ACCESS_TOKEN_SECRET}`,{
                expiresIn: "1h"
            });
            res.status(200).json({ accessToken });
        });
    } catch (error) {
        return res.status(400).send({message: error.message});
    }
}