
import BusinessApAr from "../models/businessapar.js";
import Transactions from "../models/transactions.js";
import database from "../config/connectionDatabase.js";
import Sequelize from "sequelize";
import ProductCategory from "../models/productcategory.js";
import BusinessApArDetail from "../models/businessapardetail.js";
import Products from "../models/products.js";
import date from "date-and-time";
const Op = Sequelize.Op;

BusinessApAr.hasMany(BusinessApArDetail, {
  foreignKey: "BusinessApArId",
  as: "ApArDetailHome",
});
ProductCategory.hasMany(Products, {
  foreignKey: "ProductCategoryId",
  as: "ProductHome",
});

export const GetHomeByDate = async (req, res) => {
  try {
    const Businessid = req.params.businessid;
    const StartDate = req.params.startdate;
    const EndDate = req.params.enddate;

    let convrtStartDate = new Date(StartDate);
    let convrtEndDate = new Date(EndDate);
    let newStartDate = date.format(convrtStartDate, "YYYY-MM-DD");
    let newEndDate = date.format(convrtEndDate, "YYYY-MM-DD");

    let trDate = Sequelize.where(
      Sequelize.cast(Sequelize.col("TransactionDate"), "DATE"),
      { [Op.between]: [newStartDate, newEndDate] }
    );

    let aparDate = Sequelize.where(
      Sequelize.cast(Sequelize.col("ApArDetailHome.CreatedAt"), "DATE"),
      { [Op.between]: [newStartDate, newEndDate] }
    );

    const findTransactionBalance = await Transactions.findAll({
      attributes: [
        [
          database.Sequelize.literal(`COALESCE(SUM("AmountIn"),'0')`),
          "Income",
        ],
        [
          database.Sequelize.literal(`COALESCE(SUM("AmountOut"),'0')`),
          "Expense",
        ],
      ],
      where: {
        BusinessId: { [Op.eq]: Businessid },
        TransactionDate: trDate,
      },
      raw: true,
    });

    const findBusinessApArBalance = await BusinessApAr.findAll({
      attributes: [
        [
          database.Sequelize.literal(`COALESCE(SUM("ApArDetailHome"."ApAmount"),'0')`),
          "Payable",
        ],
        [
          database.Sequelize.literal(`COALESCE(SUM("ApArDetailHome"."ApAmount"),'0')`),
          "Receiveable",
        ],
      ],
      include: {
        association: "ApArDetailHome",
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
      where: {
        BusinessId: { [Op.eq]: Businessid },
      },
      raw: true,
    });

    const findTopTransactionCategory = await Transactions.findAll({
      attributes: [
        "TransactionCategoryId",
        [
          database.Sequelize.literal(
            `COUNT("TransactionCategoryId")`
          ),
          "TotalTransaction"
        ],
      ],
      where: {
        BusinessId: { [Op.eq]: Businessid },
        TransactionDate: trDate,
      },
      group: ["TransactionCategoryId"],
      limit: 3,
      raw: true,
    });

    const findTopPersonApAr = await BusinessApAr.findAll({
      attributes: [
        "Id",
        "PersonId",
        [
          database.Sequelize.literal(
            `(COALESCE(SUM("ApArDetailHome"."ApAmount"),'0') - COALESCE(SUM("ApArDetailHome"."ArAmount"),'0') )`
          ),
          "TotalAmount",
        ],
      ],
      include: [
        {
          association: "ApArDetailHome",
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

        {
          association: "BusinessApArPerson",
          attributes: ["ContactId"],
          required: false,
        },
      ],
      where: {
        BusinessId: { [Op.eq]: Businessid },
        "$ApArDetailHome.CreatedAt$": aparDate,
      },
      group: ["BusinessApAr.Id", "BusinessApArPerson.ContactId"],
      limit: 3,
      subQuery: false,
      raw: true,
    });
    return res.status(200).json({
      TransactionBalance: findTransactionBalance,
      BusinessApArBalance: findBusinessApArBalance,
      TopTransaction: findTopTransactionCategory,
      TopBusinessApAr: findTopPersonApAr,
    });
  } catch (error) {
    return res.status(400).send({message: error.message});
  }
};

export const GetHome = async (req, res) => {
  try {
    const Businessid = req.params.businessid;

    const findTransactionBalance = await Transactions.findAll({
      attributes: [
        [
          database.Sequelize.fn("SUM", database.Sequelize.col("AmountIn")),
          "Income",
        ],
        [
          database.Sequelize.fn("SUM", database.Sequelize.col("AmountOut")),
          "Expense",
        ],
      ],
      where: {
        BusinessId: { [Op.eq]: Businessid }
      },
      raw: true,
    });

    const findBusinessApArBalance = await BusinessApAr.findAll({
      attributes: [
        [
          database.Sequelize.fn(
            "SUM",
            database.Sequelize.col("ApArDetailHome.ApAmount")
          ),
          "Payable",
        ],
        [
          database.Sequelize.fn(
            "SUM",
            database.Sequelize.col("ApArDetailHome.ApAmount")
          ),
          "Receiveable",
        ],
      ],
      include: {
        association: "ApArDetailHome",
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
      where: {
        BusinessId: { [Op.eq]: Businessid },
      },
      raw: true,
    });

    const findTopTransactionCategory = await Transactions.findAll({
      attributes: [
        "TransactionCategoryId",
        [
          database.Sequelize.fn(
            "COUNT",
            database.Sequelize.col("TransactionCategoryId")
          ),
        ],
      ],
      where: {
        BusinessId: { [Op.eq]: Businessid }
      },
      group: ["TransactionCategoryId"],
      limit: 3,
      raw: true,
    });

    const findTopPersonApAr = await BusinessApAr.findAll({
      attributes: [
        "Id",
        "PersonId",
        [
          database.Sequelize.literal(
            `(COALESCE(SUM("ApArDetailHome"."ApAmount"),'0') - COALESCE(SUM("ApArDetailHome"."ArAmount"),'0') )`
          ),
          "TotalAmount",
        ],
      ],
      include: [
        {
          association: "ApArDetailHome",
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

        {
          association: "BusinessApArPerson",
          attributes: ["ContactId"],
          required: false,
        },
      ],
      where: {
        BusinessId: { [Op.eq]: Businessid },
      },
      group: ["Id", "BusinessApArPerson.ContactId"],
      limit: 3,
      raw: true,
    });
    return res.status(200).json({
      TransactionBalance: findTransactionBalance,
      BusinessApArBalance: findBusinessApArBalance,
      TopTransaction: findTopTransactionCategory,
      TopBusinessApAr: findTopPersonApAr,
    });
  } catch (error) {
    return res.status(400).send({message: error.message});
  }
};