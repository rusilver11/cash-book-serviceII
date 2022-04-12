import Transactions from "../models/transactions.js";
import TransactionDetail from "../models/transactiondetail.js";
import BusinessApAr from "../models/businessapar.js";
import { CreateApAr } from "./businessapar.js";
import { CreateApArDetail } from "./businessapardetail.js";
import Sequelize from "sequelize";
import database from "../config/connectionDatabase.js";
import date from "date-and-time";

const Op = Sequelize.Op;

//associate
Transactions.hasMany(TransactionDetail, {
  foreignKey: "TransactionId",
  as: "TransactionDt",
});

export const GetTransactionByDate = async (req, res) => {
  try {
    const Businessid = req.params.businessid;
    const StartDate = req.params.startdate;
    const EndDate = req.params.enddate;

    let convrtStartDate = new Date(StartDate);
    let convrtEndDate = new Date(EndDate);
    let newStartDate = date.format(convrtStartDate, "YYYY-MM-DD");
    let newEndDate = date.format(convrtEndDate, "YYYY-MM-DD");

    let qrydate = Sequelize.where(
      Sequelize.cast(Sequelize.col("TransactionDate"), "DATE"),
      { [Op.between]: [newStartDate, newEndDate] }
    );

    const findTransactionByMonth = await Transactions.findAll({
      attributes: [
        "Id",
        "TransactionDate",
        "FlagTransactionType",
        "FlagStatus",
        "AmountIn",
        "AmountOut",
        "Description",
      ],
      where: {
        BusinessId: { [Op.eq]: Businessid },
        TransactionDate: qrydate,
      },
      order: [["TransactionDate"]],
      raw: true,
    });

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
        BusinessId: { [Op.eq]: Businessid },
        TransactionDate: qrydate,
      },
      raw: true,
    });

    return res.status(200).json({
      Balance: findTransactionBalance,
      Transaction: findTransactionByMonth,
    });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

export const GetTransaction = async (req, res) => {
  try {
    const Transactionid = req.params.id;
    const Businessid = req.params.businessid;

    const findTransaction = await Transactions.findAll({
      attributes: [
        "Id",
        "TransactionDate",
        "FlagTransactionType",
        "FlagStatus",
        "TransactionCategoryId",
        "AmountIn",
        "AmountOut",
        "Description",
      ],
      include: {
        association: "TransactionDt",
        attributes: ["ProductId", "Qty"],
      },
      where: {
        BusinessId: { [Op.eq]: Businessid },
        Id: { [Op.eq]: Transactionid },
        "$TransactionDt.TransactionId$": { [Op.eq]: Transactionid },
      },
    });

    return res.status(200).json({ result: findTransaction });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

export const AddTransaction = async (req, res) => {
  const Businessid = req.params.businessid;
  const {
    transactiondate,
    flagtransactiontype,
    status,
    amountin,
    amountout,
    personid,
    description,
    paymenttype,
    productid,
    qty,
  } = req.body; //header transaction

  const t = await database.transaction();

  try {
    //check transaction expense not allow to input income
    if (flagtransactiontype === "1" && amountin) {
      return (
        t.rollback(),
        res.status(405).send({message: "TransactionType Expense not allowed input Amount Income"})
      );
    }
    //check status payment when debt person need to fill cause they might auto create business ap ar
    if (status == 0 && personid == null) {
      return (
        t.rollback(),
        res.status(405).send({ message: "Person must filled, in Debt status" })
      );
    }

    let transactiondt = [];
    let countdetail;

    await Transactions.create(
      {
        TransactionDate: transactiondate,
        FlagTransactionType: flagtransactiontype,
        FlagStatus: status,
        AmountIn: amountin,
        AmountOut: amountout,
        PersonId: personid,
        Description: description,
        PaymentType: paymenttype,
        BusinessId: Businessid,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        fields: [
          "TransactionDate",
          "FlagTransactionType",
          "FlagStatus",
          "AmountIn",
          "AmountOut",
          "Description",
          "PaymentType",
          "BusinessId",
          "CreatedAt",
          "UpdatedAt",
        ],
      },
      { transaction: t }
    ).then((createTransaction) => {
      if (Array.isArray(productid)) {
        //check if detail transaction input more than one product than use bulk create
        for (let i = 0; i < productid.length; i++) {
          let detailobj = {
            TransactionId: createTransaction.Id,
            ProductId: productid[i],
            Qty: qty[i],
            CreatedAt: Date.now(),
            UpdatedAt: Date.now(),
          };
          transactiondt.push(detailobj);
        }
      } else {
        countdetail = 0;
        let detailobj = {
          TransactionId: createTransaction.Id,
          ProductId: productid,
          Qty: qty,
          CreatedAt: Date.now(),
          UpdatedAt: Date.now(),
        };
        transactiondt.push(detailobj);
      }
    });
    if (countdetail != 0) {
      //check again transactiondt value is array more than one set count
      await TransactionDetail.bulkCreate(
        transactiondt,
        {
          fields: [
            "TransactionId",
            "ProductId",
            "Qty",
            "CreatedAt",
            "UpdatedAt",
          ],
        },
        { transaction: t }
      )
        .then(() => {
          return AutoCreatedApAr()
            .then(() => {
              t.commit(),
                res.status(201).json({ message: "created successfully" });
            })
            .catch((error) => {
              throw new Error(error.message);
            });
        })
        .catch((error) => {
          return t.rollback(), res.status(400).send({ message: error.message });
        });
    } else {
      transactiondt.forEach((e) => {
        //on top transactiondt is array object than want to execute single create
        TransactionDetail.create(
          {
            TransactionId: e.TransactionId,
            ProductId: e.ProductId,
            Qty: e.Qty,
            CreatedAt: e.CreatedAt,
            UpdatedAt: e.UpdatedAt,
          },
          {
            fields: [
              "TransactionId",
              "ProductId",
              "Qty",
              "CreatedAt",
              "UpdatedAt",
            ],
          },
          { transaction: t }
        )
          .then(() => {
            return AutoCreatedApAr()
              .then(() => {
                t.commit(),
                  res.status(201).json({ message: "created successfully" });
              })
              .catch((error) => {
                throw new Error(error.message);
              });
          })
          .catch((error) => {
            return (
              t.rollback(), res.status(400).send({ message: error.message })
            );
          });
      });
    }
    //function to AutocreateApAR
    async function AutoCreatedApAr() {
      //auto create Business AP AR when status = 0/transaction is on debt else return nothing
      try {
        if (status == 0) {
          let findPersonApAr = await BusinessApAr.findOne({
            attributes: ["Id"],
            where: { PersonId: { [Op.eq]: personid } },
          });

          let newAmountout = flagtransactiontype === "0" ? 0 : amountout;
          let SetFlagApArIn = flagtransactiontype === "0" ? 0 : 1;
          if (!findPersonApAr) {
            CreateApAr(
              personid,
              Businessid,
              transactiondate,
              newAmountout, //AP
              amountin, //AR
              description,
              SetFlagApArIn
            );
          } else {
            CreateApArDetail(
              findPersonApAr.Id,
              transactiondate,
              newAmountout, //AP
              amountin, //AR
              description,
              SetFlagApArIn
            );
          }
        } else {
          return;
        }
      } catch (error) {
        throw new Error("Auto created AP or AR failed");
      }
    }
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};

export const EditTransaction = async (req, res) => {
  const Businessid = req.params.businessid;
  const Transactionid = req.params.id;
  const { transactiondate, amountin, amountout, description, paymenttype } =
    req.body;
  const t = await database.transaction();
  try {
    //check transaction epense not allow to input income
    const findTransId = await Transactions.findOne({
      where: {
        Id: { [Op.eq]: Transactionid },
      },
    });
    if (findTransId.flagtransactiontype === 1 && amountin !== null) {
      return (
        t.rollback(),
        res.status(405).send({
          message: "TransactionType Expense not allowed input Amount Income",
        })
      );
    }

    await Transactions.update(
      {
        TransactionDate: transactiondate,
        AmountIn: amountin,
        AmountOut: amountout,
        Description: description,
        PaymentType: paymenttype,
      },
      {
        where: {
          Id: { [Op.eq]: Transactionid },
          BusinessId: { [Op.eq]: Businessid },
        },
      },
      { transaction: t }
    );
    return (
      await t.commit(),
      res.status(204).json({ message: "Updated successfully" })
    );
  } catch (error) {
    return await t.rollback(), res.status(400).json({ message: error.message });
  }
};

export const DeleteTransaction = async (req, res) => {
  const Transactionid = req.params.id;
  const Businessid = req.params.businessid;
  const t = await database.transaction();
  try {
    await TransactionDetail.destroy(
      {
        where: {
          TransactionId: { [Op.eq]: Transactionid },
        },
      },
      { transaction: t }
    );
    await Transactions.destroy(
      {
        where: {
          Id: { [Op.eq]: Transactionid },
          BusinessId: { [Op.eq]: Businessid },
        },
      },
      { transaction: t }
    );
    //pr: AP AR update set to lunas
    return (
      await t.commit(),
      res.status(204).json({ message: "deleted successfully" })
    );
  } catch (error) {
    return await t.rollback(), res.status(400).json({ message: error.message });
  }
};