import Sequelize from "sequelize";
import database from "../config/connectionDatabase.js";
import BusinessApAr from "../models/businessapar.js";
import BusinessApArDetail from "../models/businessapardetail.js";
const Op = Sequelize.Op;

//associate
BusinessApAr.hasMany(BusinessApArDetail, {
  foreignKey: "BusinessApArId",
  as: "ApArDetailIn",
});
BusinessApAr.hasMany(BusinessApArDetail, {
  foreignKey: "BusinessApArId",
  as: "ApArDetailOut",
});


export const GetBusinessApAr = async(req,res) => {
const businessid = req.params.businessid;
//const userid = req.params.userid;
try {
 const findPersonApAr = await BusinessApAr.findAll({
    attributes:["Id","PersonId","DueDate",
    [database.Sequelize.literal(`COALESCE(CAST((sum("ApArDetailOut"."Amount") - sum("ApArDetailIn"."Amount"))as money),'0')`),"TotalAmount"]
      ],
    include:[
      {association:"ApArDetailIn",attributes:{exclude:["Id","BusinessApArId","ApArDate","Amount","Description","FlagApArIn","CreatedBy","CreatedAt","UpdatedAt"]},required:false,where:{FlagApArIn:{[Op.eq]:1}}},
      {association:"ApArDetailOut",attributes:{exclude:["Id","BusinessApArId","ApArDate","Amount","Description","FlagApArIn","CreatedBy","CreatedAt","UpdatedAt"]},required:false,where:{FlagApArIn:{[Op.eq]:0}}},
      {association:"BusinessApArPerson",attributes:["ContactId"]}
    ],where:{
      BusinessId: {[Op.eq]:businessid}
    },group: ["BusinessApAr.Id", "BusinessApAr.PersonId","BusinessApArPerson.ContactId","BusinessApArPerson.Id"],
    raw:true
  });

  return res.status(200).json({result: findPersonApAr});
} catch (error) {
  return res.status(400).json({message: error.message});
}
};

export const AddBusinessApAr = async (req, res) => {
  const {
    //header
    personid,
    businessid,
    createdby,
    //detail
    apardate,
    amount,
    description,
    flagaparin,
  } = req.body;
  const t = await database.transaction();
  try {
    const CreateApAr = await BusinessApAr.create(
      {
        PersonId: personid,
        BusinessId: businessid,
        CreatedBy: createdby,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        fields: [
          "PersonId",
          "BusinessId",
          "CreatedBy",
          "CreatedAt",
          "UpdatedAt",
        ],
      },
      { transaction: t }
    );
    await BusinessApArDetail.create(
      {
        BusinessApArId: CreateApAr.Id,
        ApArDate: apardate,
        Amount: amount,
        Description: description,
        FlagApArIn: flagaparin,
        CreatedBy: createdby,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        fields: [
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
      { transaction: t }
    );
    return (
      t.commit(), res.status(200).json({ message: "Business AP or AR created" })
    );
  } catch (error) {
    return t.rollback(), res.status(400).json({ message: error.message });
  }
};

  export const EditBusinessApAr = async (req, res) => {
    const Businessaparid =  req.params.businessaparid
    const Businessid =  req.params.businessid
    const {duedate} = req.body;
    const t = await database.transaction();
    try {
      await BusinessApAr.update(
        {
          DueDate: duedate,
          UpdatedAt: Date.now(),
        },
        {
         where:{
             BusinessId: Businessid,
             Id: Businessaparid,
         }
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
    const Businessaparid =  req.params.businessaparid
    const Businessid =  req.params.businessid
    const t = await database.transaction();
    try {

        await BusinessApArDetail.destroy(
            {
                where:{
                    BusinessApArId:Businessaparid
                }
            },{transaction:t}
        );

        await BusinessApAr.destroy(
        {
            where:{
                BusinessId: Businessid,
                Id: Businessaparid,
            }
        },{transaction:t}
        );
       
      return (
        t.commit(), res.status(200).json({ message: "Business AP or AR Deleted" })
      );
    } catch (error) {
      return t.rollback(), res.status(400).json({ message: error.message });
    }
  };