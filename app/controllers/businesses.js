import Businesses from "../models/businesses.js";
import Sequelize from "sequelize";
import database from "../config/connectionDatabase.js";

const Op = Sequelize.Op;

export const GetAllBusinesses = async (req, res) => {
  try {
    const UserId = req.params.userid;
    const findBusinesses = await Businesses.findAll({
      attributes: ["Id", "Name"],
      where: {
        UserId: { [Op.eq]: UserId },
      },
      order:[["CreatedAt","ASC"]]
    });

    return res.status(200).json(findBusinesses);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: error.message });
  }
};

export const GetBusinesses = async (req, res) => {
  try {
    const businessid = req.params.id;
    const findBusinesses = await Businesses.findAll({
      attributes:["Id","UserId","Name"],
      include: { 
        association:"BusinessCategory",
        attributes: ["Id","Name"]
      },
      where: {
        Id: { [Op.eq]: businessid },
      },
      order:[["CreatedAt","ASC"]]
    });
    return res.status(200).json(findBusinesses);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: error.message });
  }
};

export const AddBusinesses = async (req, res) => {
  const UserId = req.params.userid
  const {category, name } = req.body;
  const t = await database.transaction();
  try {
    const createBusinesses = await CreateBusinesses(UserId,category,name);
    return await t.commit(), res.status(201).json({result:createBusinesses});
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};

export const CreateBusinesses = async(userId, businesscategoryId, name) =>{
  const t = await database.transaction();
  try {
    const createBusinesses = await Businesses.create(
      {
        UserId: userId,
        BusinessCategoryId: businesscategoryId,
        Name: name,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        fields: ["UserId", "BusinessCategoryId", "Name", "CreatedAt", "UpdatedAt"],
      },
      { transaction: t }
    );
    return await t.commit(), createBusinesses;
  } catch (error) {
    return await t.rollback();
  }
}

export const EditBusinesses = async (req, res) => {
  const businessid = req.params.id;
  const { category, name } = req.body;
  const t = await database.transaction();
  try {
    await Businesses.update(
      {
        BusinessCategoryId: category,
        Name: name,
        UpdatedAt: Date.now(),
      },
      {
        where: {
          Id: businessid,
        },
      },
      { transaction: t }
    );
    return await t.commit(), res.status(204).json({message: "updated successfully"});
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};

export const DeleteBusinesses = async (req, res) => {
  const businessid = req.params.id;
  const t = await database.transaction();
  try {
   await database
      .query(
        `DELETE FROM "BusinessApArDetail" WHERE "BusinessApArId" IN  (SELECT "Id" FROM "BusinessApAr" WHERE "BusinessId" = :businessid)`,
        {
          replacements: { businessid: businessid },
          type: Sequelize.QueryTypes.DELETE,
          transaction: t,
        }
      );
      await database
      .query(
        `DELETE FROM "BusinessApAr" WHERE "BusinessId" = :businessid`,
        {
          replacements: { businessid: businessid },
          type: Sequelize.QueryTypes.DELETE,
          transaction: t,
        }
      );
   await database
      .query(
        `DELETE FROM "TransactionDetail" WHERE "TransactionId" IN  (SELECT "Id" FROM "Transactions" WHERE "BusinessId" = :businessid)`,
        {
          replacements: { businessid: businessid },
          type: Sequelize.QueryTypes.DELETE,
          transaction: t,
        }
      ),
      await database
      .query(
        `DELETE FROM "Transactions" WHERE "BusinessId" = :businessid`,
        {
          replacements: { businessid: businessid },
          type: Sequelize.QueryTypes.DELETE,
          transaction: t,
        }
      );
      await database
      .query(
        `DELETE FROM "Products" WHERE "BusinessId" = :businessid`,
        {
          replacements: { businessid: businessid },
          type: Sequelize.QueryTypes.DELETE,
          transaction: t,
        }
      );
      await database
      .query(
        `DELETE FROM "ProductCategory" WHERE "BusinessId" = :businessid`,
        {
          replacements: { businessid: businessid },
          type: Sequelize.QueryTypes.DELETE,
          transaction: t,
        }
      );
      await database
      .query(
        `DELETE FROM "Businesses" WHERE "Id" = :businessid`,
        {
          replacements: { businessid: businessid },
          type: Sequelize.QueryTypes.DELETE,
          transaction: t,
        }
      );
      
    return await t.commit(), res.status(204).json({message:"deleted successfully"});
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};
