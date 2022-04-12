import Sequelize from "sequelize";
import database from "../config/connectionDatabase.js";
import BusinessApAr from "../models/businessapar.js";
import BusinessApArDetail from "../models/businessapardetail.js";
import { CreateApArDetail } from "./businessapardetail.js";
const Op = Sequelize.Op;

//associate
BusinessApAr.hasMany(BusinessApArDetail, {
  foreignKey: "BusinessApArId",
  as: "ApArDetailBusinessApAr",
});

export const GetBusinessApAr = async (req, res) => {
  const businessid = req.params.businessid;
  try {
    const findPersonApAr = await BusinessApAr.findAll({
      attributes: [
        "Id",
        "PersonId",
        "DueDate",
        [
          database.Sequelize.literal(
            `(COALESCE(SUM("ApArDetailBusinessApAr"."ApAmount"),'0') - COALESCE(SUM("ApArDetailBusinessApAr"."ArAmount"),'0') )`
          ),
          "TotalAmount",
        ],
      ],
      include: [
        {
          association: "ApArDetailBusinessApAr",
          attributes: {
            exclude: [
              "Id",
              "BusinessApArId",
              "ApArDate",
              "ApAmount",
              "ArAmount",
              "Description",
              "FlagApArIn",
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
      },
      group: [
        "BusinessApAr.Id",
        "BusinessApAr.PersonId",
        "BusinessApArPerson.ContactId"
      ],
      raw: true,
    });

    return res.status(200).json({ result: findPersonApAr });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const AddBusinessApAr = async (req, res) => {
  const BusinessId = req.params.businessid;
  const {
    //header
    personid,
    //detail
    apardate,
    apamount,
    aramount,
    description,
    flagaparin,
  } = req.body;
  try {
    if(apamount && aramount){
      return res.status(405).json({message:"Please choose one AP or AR"})
    }else if(flagaparin == 1 && aramount) {
      return res.status(405).json({message:"Flag type In not allow input AR Amount"})
    }else if(flagaparin == 0 && apamount){
      return res.status(405).json({message:"Flag type Out not allow input AP Amount"})
    }else{
    const findApAr = await BusinessApAr.findOne({
      attributes: ["Id"],
      where: {
        BusinessId: BusinessId,
        PersonId: personid,
      },
      raw: true,
    });
    if (findApAr) {
      CreateApArDetail(
        findApAr.Id,
        apardate,
        apamount,
        aramount,
        description,
        flagaparin
      );
    } else {
      await CreateApAr(
        personid,
        BusinessId,
        apardate,
        apamount,
        aramount,
        description,
        flagaparin
      );
    }
  }
    return res.status(201).json({ message: "Business AP or AR created" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const CreateApAr = async (
  //header
  personid,
  businessid,
  //detail
  apardate,
  apamount,
  aramount,
  description,
  flagaparin
) => {
  const t = await database.transaction();
  try {
    const CreateApAr = await BusinessApAr.create(
      {
        PersonId: personid,
        BusinessId: businessid,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        fields: ["PersonId", "BusinessId", "CreatedAt", "UpdatedAt"],
      },
      { transaction: t }
    );
    await CreateApArDetail(
      CreateApAr.Id,
      apardate,
      apamount,
      aramount,
      description,
      flagaparin
    );
    
    return await t.commit();
  } catch (error) {
    await t.rollback();
    throw new Error(error.message);
  }
};

export const EditBusinessApAr = async (req, res) => {
  const Businessaparid = req.params.id;
  const Businessid = req.params.businessid;
  const { duedate } = req.body;
  const t = await database.transaction();
  try {
    await BusinessApAr.update(
      {
        DueDate: duedate,
        UpdatedAt: Date.now(),
      },
      {
        where: {
          BusinessId: Businessid,
          Id: Businessaparid,
        },
      },
      { transaction: t }
    );
    return (
      t.commit(), res.status(200).json({ message: "Business AP or AR Updated" })
    );
  } catch (error) {
    return t.rollback(), res.status(400).json({ message: error.message });
  }
};

export const DeleteBusinessApAr = async (req, res) => {
  const Businessaparid = req.params.id;
  const Businessid = req.params.businessid;
  const t = await database.transaction();
  try {
    await BusinessApArDetail.destroy(
      {
        where: {
          BusinessApArId: Businessaparid,
        },
      },
      { transaction: t }
    );

    await BusinessApAr.destroy(
      {
        where: {
          BusinessId: Businessid,
          Id: Businessaparid,
        },
      },
      { transaction: t }
    );

    return (
      await t.commit(),
      res.status(200).json({ message: "Business AP or AR Deleted" })
    );
  } catch (error) {
    return await t.rollback(), res.status(400).json({ message: error.message });
  }
};