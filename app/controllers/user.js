import Users from "../models/users.js";
import Businesses from "../models/businesses.js";
import Sequelize from "sequelize";
import jwt from "jsonwebtoken";
import database from "../config/connectionDatabase.js";
import WAClient from "../../server.js";
import PhoneFormat from "../library/phoneformat.js";
import otpgenerate from "../library/numbergenerate.js";
import date from "date-and-time";
const Op = Sequelize.Op;

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["Id", "Name", "Phone", "CreatedAt", "UpdatedAt"],
    });
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400)
  }
};

export const Login = async (req, res, next) => {
  const { phone } = req.body;
//validate register whatsapp
  const checkRegisteredNumber = async function (number) {
    const isRegistered = await WAClient.isRegisteredUser(number);
    return isRegistered;
  };

  const formatnumber = PhoneFormat(phone);
  const isRegisterdNumber = await checkRegisteredNumber(formatnumber);

  if (!isRegisterdNumber) {
    return res.status(404).send({message: "the number is not registered on WhatsApp"});
  }
  let today = new Date();
  let exptoday = date.addMinutes(today, 5);
  const t = await database.transaction();
  try {
    //check is user with phone number already exist
    const availableuser = await Users.findOne(
      {
        where: {
          Phone: { [Op.eq]: phone },
        },
        attributes: ["Id", "OTP", "OTPExpired"],
      },
      { transaction: t }
    );
    //check user if user already exist just update data 
    //and if user not exist create new user data
    let CreateUser;
    let UpdateUser;
    if (!availableuser) {
      //create user
       CreateUser = await Users.create(
        {
          Name: "Juragan", //default
          Phone: phone,
          OTP: otpgenerate(5),
          OTPExpired: exptoday,
          CreatedAt: Date.now(),
          UpdatedAt: Date.now(),
        },
        {
          fields: [
            "Name",
            "Phone",
            "OTP",
            "OTPExpired",
            "CreatedAt",
            "UpdatedAt",
          ],
        },
        { transaction: t }
      );
      //create business
      await Businesses.create(
        {
          UserId: CreateUser.Id,
          Name: "Usaha Juragan",
          CreatedAt: Date.now(),
          UpdatedAt: Date.now(),
        },
        {
          fields: ["UserId", "CreatedAt", "UpdatedAt"],
        },
        { transaction: t }
      );
    } else {
      //update otp and otp expired
       UpdateUser = await Users.update(
        {
          OTP: otpgenerate(5),
          OTPExpired: exptoday,
          UpdatedAt: Date.now(),
        },
        {
          where: {
            Id: availableuser.Id,
          },
        },
        { transaction: t }
      );
    }
    return (
      await t.commit(),
      res.status(201).send({ message: "OTP has send please verify your OTP"})
      ,next() );
  } catch (error) {
    console.error(error);
    return (
      await t.rollback(),
      res.status(400).send({message: "Failed to send OTP",response: error.message})
    );
  }
};

export const VerifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
  const today = new Date();
  let formattoday = date.format(today, "YYYY/MM/DD HH:mm:ss Z");
  const t = await database.transaction();
  try {
    const checkUser = await Users.findOne(
      {
        where: {
          Phone: { [Op.eq]: phone },
          OTP: { [Op.eq]: otp },
        },
        attributes: ["Id", "Phone", "OTP", "OTPExpired"]
      },
      { transaction: t }
    );

    if (!checkUser){
      return res.status(400).send({ response: "OTP invalid" })
    }else if(date.format(checkUser.OTPExpired, "YYYY/MM/DD HH:mm:ss Z") < formattoday){
      return res.status(400).send({ response: "OTP Expired" })
    }

    //create token
    const UserId = checkUser.Id;
    const Phone = checkUser.Phone;
    const Otp = checkUser.OTP;
    const accessToken = jwt.sign(
      { UserId, Phone, Otp },
      `${process.env.ACCESS_TOKEN_SECRET}`,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      { UserId, Phone, Otp },
      `${process.env.REFRESH_TOKEN_SECRET}`,
      {
        expiresIn: "1d",
      }
    );
    await Users.update(
      { RefreshToken: refreshToken },
      {
        where: {
          Id: { [Op.eq]: UserId }
        }
      },
      { transaction: t }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 86400000, //24h
    });
    return await t.commit(), res.status(200).json({ message: "Verification success" ,
    token: accessToken,
  refreshToken: refreshToken });
  } catch (error) {
    return await t.rollback(), res.status(400).send({ response: error.message });
  }
};

export const Logout = async (req, res) => {
  try {
    const refresToken = req.body.token;
    const userid = req.params.userid;
    if (!refresToken) return res.sendStatus(433);
    const t = await database.transaction();
    const User = await Users.findOne(
      {
        where: {
          Id: { [Op.eq]: userid},
          RefreshToken: { [Op.eq]: refresToken },
        },
      },
      { transaction: t }
    );

    if (!User)
      return (
        t.rollback(),
        res
          .status(400)
          .send({ message: "refresh token invalid or doesn't exist" })
      );

    await Users.update(
      {
        RefreshToken: null,
        StatusVerified: 0,
      },
      {
        where: {
          Id: { [Op.eq]: User.Id },
        },
      }
    );
    res.clearCookie("refreshToken");
    return await t.commit(),res.sendStatus(204);
  } catch (error) {
    await t.rollback();
    return res.status(400).send({ message: error });
  }
};
