import Businesses from "../models/businesses.js";
import Transactions from "../models/transactions.js";
import TransactionDt from "../models/transactiondetail.js";
import Sequelize from "sequelize";
import database from "../config/connectionDatabase.js";

const Op = Sequelize.Op;

export const GetBusinesses = async (req, res) => {
  try {
    const userid = req.params.id;
    const findBusinesses = await Businesses.findAll({
      where: {
        UserId: { [Op.eq]: userid },
      },
      attributes: ["Id", "Name"],
    });

    return res.status(200).json(findBusinesses);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: "Businesses not found" });
  }
};

export const AddBusinesses = async (req, res) => {
  const { userid, category, name } = req.body;
  const t = await database.transaction();
  try {
    const createBusinesses = await Businesses.create(
      {
        UserId: userid,
        BusinessCategoryId: category,
        Name: name,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        fields: ["UserId", "BusinessCategoryId", "CreatedAt", "UpdatedAt"],
      },
      { transaction: t }
    );
    return await t.commit(), res.status(200).json(createBusinesses);
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};

export const EditBusinesses = async (req, res) => {
  const id = req.params.id;
  const { category, name } = req.body;
  const t = await database.transaction();
  try {
    const createBusinesses = await Businesses.update(
      {
        BusinessCategoryId: category,
        Name: name,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        where: {
          Id: id,
        },
      },
      { transaction: t }
    );
    return await t.commit(), res.status(200).json(createBusinesses);
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};

export const DeleteBusinesses = async (req, res) => {
  const id = req.params.id;
  const t = await database.transaction();
  try {
    
    await database.query(
      'DELETE FROM "TransactionDetail" WHERE "TransactionId" IN  (SELECT "Id" FROM "Transactions" WHERE "BusinessId" = :businessid)',
      {
        replacements: { businessid: id },
        type: Sequelize.QueryTypes.DELETE,
        transaction:t
      }
    ).then(()=>{
      Transactions.destroy(
        {
          where: {
            BusinessId: { [Op.eq]: id },
          },
        },
        { transaction: t }
      );
    });

    await Businesses.destroy(
      {
        where: {
          Id: id,
        },
      },
      { transaction: t }
    );

    return await t.commit(), res.status(200).send("Delete Business successed");
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};
