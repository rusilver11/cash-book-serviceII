import Transactions from "../models/transactions.js";
import TransactionDetail from "../models/transactiondetail.js";
import Sequelize from "sequelize";
import database from "../config/connectionDatabase.js";

const Op = Sequelize.Op;

export const AddTransaction = async (req, res) => {
  const {
    businessid,
    userid,
    transactiondate,
    transactiontype,
    status,
    amount,
    description,
    paymenttype,
    productid,
    qty,
  } = req.body; //header transaction

  const t = await database.transaction();

  try {
    let transactiondt = [];

    await Transactions.create(
      {
        TransactionDate: transactiondate,
        TransactionType: transactiontype,
        Status: status,
        Amount: amount,
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
          "TransactionType",
          "Status",
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
    ).then((createTransaction)=>{
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
    ).then(()=>{
      return   t.commit(),res.status(200).json({ message: "Transaction Created"});
    }).catch(error =>{
      return  t.rollback(), res.status(400).send({ message: error.message });
    });
    
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};
