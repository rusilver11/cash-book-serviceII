import Sequelize from "sequelize";
import database from "../config/connectionDatabase.js";
import BusinessApAr from "../models/businessapar.js";
import BusinessApArDetail from "../models/businessapardetail.js";
const Op = Sequelize.Op;

//associate
BusinessApAr.hasMany(BusinessApArDetail, {
  foreignKey: "BusinessApArId",
  as: "ApArDetail",
});

export const GetBusinessApArDetail = async (req, res) => {
  const businessaparid = req.params.businessaparid;
  const businessid = req.params.businessid;
  try {
    const findBusinessApArDt = await BusinessApArDetail.findAll({
      attributes: ["ApArDate", "Amount", "Description", "FlagApArIn"],
      where: {
        BusinessApArId: { [Op.eq]: businessaparid },
      },
      order: [["ApArDate", "ASC"]],
      raw: true,
    });

    const findPersonApArHd = await BusinessApAr.findAll({
      attributes: [
        "PersonId",
        "DueDate",
        [
          database.Sequelize.literal(`
        COALESCE(CAST(SUM((case
            when "ApArDetail"."FlagApArIn"= 1
            then "ApArDetail"."Amount" else '0' end ) -
            (case
            when "ApArDetail"."FlagApArIn"= 0
            then "ApArDetail"."Amount" else '0' end )) as money),'0')
        `),
          "TotalAmount",
        ],
      ],
      include: [
        {
          association: "ApArDetail",
          attributes: {
            exclude: [
              "Id",
              "BusinessApArId",
              "ApArDate",
              "Amount",
              "Description",
              "FlagApArIn",
              "CreatedBy",
              "CreatedAt",
              "UpdatedAt",
            ],
          },
          required: false,
        },
        { association: "BusinessApArPerson", attributes: ["ContactId"] },
      ],
      where: {
        BusinessId: { [Op.eq]: businessid },
        Id: { [Op.eq]: businessaparid },
      },
      group: [
        "BusinessApAr.Id",
        "BusinessApAr.PersonId",
        "BusinessApArPerson.ContactId",
        "BusinessApArPerson.Id",
      ],
      raw: true,
    });

    return res.status(200).json({
      BusinessApArHd: findPersonApArHd,
      BusinessApArDt: findBusinessApArDt,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const AddBusinessApArDetail = async (req, res) => {
  const businessaparid = req.params.businessaparid;
  const { apardate, apamount, aramount,description, flagaparin } = req.body;
  try {
    if(apamount && aramount){
      return res.status(405).json({message:"Please choose one AP or AR"})
    }else if(flagaparin == "1" && aramount) {
      return res.status(405).json({message:"Flag type In not allow input AR Amount"})
    }else if(flagaparin == "0" && apamount){
      return res.status(405).json({message:"Flag type Out not allow input AP Amount"})
    }else{
    await CreateApArDetail(
      businessaparid,
      apardate,
      apamount,
      aramount,
      description,
      flagaparin
    );
    return res.status(201).json({ message: "Ap or Ar Detail Created" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const CreateApArDetail = async (
  businessaparid,
  apardate,
  apamount,
  aramount,
  description,
  flagaparin
) => {
  const t = await database.transaction();
  try {
    const findBusinessApArHd = await BusinessApAr.findOne({
      where: {
        Id: { [Op.eq]: businessaparid },
      },
    });
    if (!findBusinessApArHd) {
      await t.rollback();
      throw new Error(
        "AP or AR Header doesn't exist, please create header first!"
      );
    } else {
      await BusinessApArDetail.create(
        {
          BusinessApArId: businessaparid,
          ApArDate: apardate,
          ApAmount: apamount,
          ArAmount: aramount,
          Description: description,
          FlagApArIn: flagaparin,
          CreatedAt: Date.now(),
          UpdatedAt: Date.now(),
        },
        { transaction: t }
      );
      return await t.commit();
    }
  } catch (error) {
    await t.rollback();
    throw new Error(error.message);
  }
};