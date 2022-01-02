import WAClient from "../../server.js";
import Users from "../models/users.js";
import Sequelize from "sequelize";
import PhoneFormat from "../library/phoneformat.js";
import database from "../config/connectionDatabase.js";
import date from "date-and-time";
const Op = Sequelize.Op;

export const SendOTP = async (req, res) => {
  const { phone } = req.body;
  const formatnumber = PhoneFormat(phone);
  //promise
  await Users.findOne({
    where: {
      Phone: { [Op.eq]: phone },
    },
    attributes: ["Id", "OTP", "OTPExpired", "StatusVerified"],
  })
    .then((userotp) => {
      WAClient.sendMessage(
        formatnumber,
        `Masukan kode verifikasi (OTP) ${userotp.OTP} dalam 5 menit`
      )
        .then(() => {
         return console.log("OTP has send");
        })
        .catch((error) => {
         return console.error(error);
        });
    })
    .catch((error) => {
     return console.error(error);
    });
};

export const VerifyOTP = async (req,res,next) =>{
    const {phone,otp} = req.body;
    const today = new Date();
    let formattoday = date.format(today,"YYYY/MM/DD HH:mm:ss Z");
    const t = await database.transaction();
    try {
        const checkUser = await Users.findOne({
            where:{
                Phone: { [Op.eq]: phone },
                OTP: { [Op.eq]: otp }
            },
            attributes: ["Id", "OTP", "OTPExpired", "StatusVerified"]
        },{transaction:t});

        if(!checkUser) return t.rollback(),res.status(400).send({ message: "User not register or OTP Expired" });

        let expformat = date.format(checkUser.OTPExpired,"YYYY/MM/DD HH:mm:ss Z");
        if(expformat < formattoday) return await t.rollback(),res.status(400).send({message: "OTP has Expired"});

        await checkUser.update(
            {StatusVerified : 1},
            {
                where:{
                    Id:{[Op.eq]:checkUser.Id}
                }
        },{transaction:t})
        
        console.log("OTP Valid");
        return await t.commit(),next();
    } catch (error) {
        console.error(error);
        return await t.rollback(),res.status(400).json({response: error});
    }
}
