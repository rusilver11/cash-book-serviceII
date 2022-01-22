import Transactions from "../models/transactions.js";
import TransactionDetail from "../models/transactiondetail.js";
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
    });

    const findTransactionBalance = await Transactions.findAll({
      attributes: [
        [
          database.Sequelize.fn("SUM", database.Sequelize.col("AmountIn")),
          "Income",
        ],
        [
          database.Sequelize.fn("SUM", database.Sequelize.col("AmountOut")),
          "Outcome",
        ],
      ],
      where: {
        BusinessId: { [Op.eq]: Businessid },
        TransactionDate: qrydate,
      },
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

    return res.status(200).json({ result: findTransactionByMonth });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

export const AddTransaction = async (req, res) => {
  const {
    businessid,
    userid,
    transactiondate,
    flagtransactiontype,
    status,
    amountin,
    amountout,
    description,
    paymenttype,
    productid,
    qty,
  } = req.body; //header transaction

  const t = await database.transaction();

  try {
    if (flagtransactiontype === 1 && amountin !== null) {
      return res.status(400).send({
        message: "TransactionType Outcome not allowed input Amount Income",
      });
    }

    let transactiondt = [];
    await Transactions.create(
      {
        TransactionDate: transactiondate,
        FlagTransactionType: flagtransactiontype,
        FlagStatus: status,
        AmountIn: amountin,
        AmountOut: amountout,
        Description: description,
        PaymentType: paymenttype,
        BusinessId: businessid,
        CreatedBy: userid,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        fields: [
          "TransactionDate",
          "FlagTransactionType",
          "FlagStatus",
          "Amount",
          "Description",
          "PaymentType",
          "BusinessId",
          "CreatedBy",
          "CreatedAt",
          "UpdatedAt",
        ],
      },
      { transaction: t }
    ).then((createTransaction) => {
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
    });

    await TransactionDetail.bulkCreate(
      transactiondt,
      {
        fields: ["TransactionId", "ProductId", "Qty", "CreatedAt", "UpdatedAt"],
      },
      { transaction: t }
    )
      .then(() => {
        return (
          t.commit(), res.status(200).json({ message: "Transaction Created" })
        );
      })
      .catch((error) => {
        return t.rollback(), res.status(400).send({ message: error.message });
      });
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
    Transactions.hasMany(TransactionDetail, {
      foreignKey: "TransactionId",
      as: "TransactionDt",
    });

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
      await t.commit(), res.status(200).json({ message: "Transaction Updated" })
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
      await t.commit(), res.status(200).json({ message: "Transaction Deleted" })
    );
  } catch (error) {
    return await t.rollback(), res.status(400).json({ message: error.message });
  }
};
