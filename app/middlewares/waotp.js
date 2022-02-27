import WAClient from "../../server.js";
import Users from "../models/users.js";
import Sequelize from "sequelize";
import PhoneFormat from "../library/phoneformat.js";
import database from "../config/connectionDatabase.js";
import date from "date-and-time";
import otpgenerate from "../library/numbergenerate.js";
const Op = Sequelize.Op;

export const SendOTP = async (req) => {
  const { phone } = req.body;
  //promise
  await Users.findOne({
    where: {
      Phone: { [Op.eq]: phone },
    },
    attributes: ["Id", "OTP"],
  })
    .then((userotp) => {
      SendWAMessage(phone, userotp.OTP)
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

export const ResendOTP = async (req, res) => {
  const { phone } = req.body;
  let today = new Date();
  let exptoday = date.addMinutes(today, 5);
  let otpnumber = otpgenerate(5);
  const t = await database.transaction();
  try {
    const findUser = await Users.findOne(
      {
        where: {
          Phone: { [Op.eq]: phone },
        },
        attributes: ["Id", "OTP", "OTPExpired"],
      },
      { transaction: t }
    );
    if(!findUser) return t.rollback(), res.status(404).send({message:"User doesn't exist cannot resend OTP"})
    await Users.update(
      {
        OTP: otpnumber,
        OTPExpired: exptoday,
        UpdatedAt: Date.now(),
      },
      {
        where: {
          Id: { [Op.eq]: findUser.Id },
        },
      },
      { transaction: t }
    );
    await t.commit();
    res.status(200).send({ message: "Success to resend OTP" });
    return SendWAMessage(phone, otpnumber);
  } catch (error) {
    await t.rollback();
    return res.status(400).send({
      message: "Failed to resend OTP",
      response: error,
    });
  }
};

async function SendWAMessage (phone, message) {
  //check is number already registered in WA
  const checkRegisteredNumber = async function (number) {
    const isRegistered = await WAClient.isRegisteredUser(number);
    return isRegistered;
  };
  const formatnumber = PhoneFormat(phone);
  const isRegisterdNumber = await checkRegisteredNumber(formatnumber);

  if (!isRegisterdNumber) {
    return res.status(404).send({ message: "the number is not registered" });
  }
  const content = `Masukan kode verifikasi (OTP) ${message} dalam 5 menit`;
  //send message
  await WAClient.sendMessage(formatnumber, content);
}
