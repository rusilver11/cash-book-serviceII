import Persons from "../models/products.js";
import Sequelize from "sequelize";
import database from "../config/connectionDatabase.js";

const Op = Sequelize.Op;

export const GetAllContact = async (req, res) => {
  try {
    const userid = req.params.userid;
    const FindPersons = await Persons.findAll({
      attributes: ["Id", "ContactId"],
      where: {
        UserId: { [Op.eq]: userid },
      },
    });
    return res.status(200).json(FindPersons);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

export const AddContact = async (req, res) => {
  const { userid, contactid } = req.body;
  const t = await database.transaction();
  try {
    const createperson = await Persons.create(
      {
        UserId: userid,
        ContactId: contactid,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        fields: ["UserId", "ContactId", "CreatedAt", "UpdatedAt"],
      },
      { transaction: t }
    );
    return t.commit(), res.status(200).json({ result: createperson });
  } catch (error) {
    return t.rollback(), res.status(400).send({ message: error.message });
  }
};