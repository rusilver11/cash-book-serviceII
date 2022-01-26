import Sequelize from "sequelize";
import database from "../config/connectionDatabase.js";
import ProductCategory from "../models/productcategory.js";
import Products from "../models/products.js";
import Transactions from "../models/transactions.js";
import TransactionDetail from "../models/transactiondetail.js";
const Op = Sequelize.Op;

//associate
ProductCategory.hasMany(Products, {
  foreignKey: "ProductCategoryId",
  as: "TransactionDtProduct",
});

export const GetTransactionDetail = async (req, res) => {
  try {
    const Businessid = req.params.businessid;
    const Transactiontypeid = req.params.typeid;
    const Transactionid = req.params.transactionid;

    const products = await ProductCategory.findAll({
      attributes: ["Id", "Name"],
      include: {
        association: "TransactionDtProduct",
        attributes: {
          exclude: [
            "FlagTransactionType",
            "ProductCategoryId",
            "BusinessId",
            "CreatedBy",
            "CreatedAt",
            "UpdatedAt",
          ],
          include: [
            [
              Sequelize.literal(
                `(coalesce((
                    select coalesce(x."Qty",0 ) as "Qty"
                        from "TransactionDetail" as x
                        where x."ProductId" = "TransactionDtProduct"."Id"
                        and"TransactionId" = '${Transactionid}'
                ),0))`
              ),
              "Qty",
            ],
          ],
        },
      },
      where: {
        BusinessId: { [Op.eq]: Businessid },
        "$TransactionDtProduct.FlagTransactionType$": {
          [Op.or]: [Transactiontypeid, 2],
        },
      },
      order: [["Name", "ASC"]],
    });
    return res.status(200).json({ result: products });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const AddTransactionDetail = async (req, res) => {
  const Transactionid = req.params.transactionid;
  const { Productid, Qty } = req.body;
  const t = await database.transaction();
  try {
    if (Array.isArray(Productid)) {
      let transactiondt = [];
      for (let i = 0; i < Productid.length; i++) {
        let detailobj = {
          TransactionId: Transactionid,
          ProductId: Productid[i],
          Qty: Qty[i],
          CreatedAt: Date.now(),
          UpdatedAt: Date.now(),
        };
        transactiondt.push(detailobj);
      }
      await TransactionDetail.bulkCreate(transactiondt, { transaction: t });
    } else {
      await TransactionDetail.create(
        {
          TransactionId: Transactionid,
          ProductId: Productid,
          Qty: Qty,
          CreatedAt: Date.now(),
          UpdatedAt: Date.now(),
        },
        { transactionid: t }
      );
    }
    return (
      await t.commit(),
      res.status(200).json({ message: "Transaction detail Created" })
    );
  } catch (error) {
    return await t.rollback(), res.status(400).json({ message: error.message });
  }
};

export const EditTransactionDetail = async (req, res) => {
  const Transactionid = req.params.transactionid;
  const { Productid, Qty } = req.body;
  const t = await database.transaction();
  try {
    if (Array.isArray(Productid)) {
      Productid.forEach((Productidarr) => {
        //if qty product set to zero means delete from detail transaction
        if (Qty[i] == 0) {
          TransactionDetail.destroy(
            {
              where: {
                TransactionId: { [Op.eq]: Transactionid },
                ProductId: { [Op.eq]: Productidarr },
              },
            },
            { transaction: t }
          );
        } else {
          TransactionDetail.update(
            {
              Qty: Qty[i],
              UpdateAt: Date.now(),
            },
            {
              where: {
                TransactionId: { [Op.eq]: Transactionid },
                ProductId: { [Op.eq]: Productidarr },
              },
            },
            { transactionid: t }
          );
        }
      });
    } else {
      await TransactionDetail.update(
        {
          Qty: Qty,
          UpdateAt: Date.now(),
        },
        {
          where: {
            TransactionId: { [Op.eq]: Transactionid },
            ProductId: { [Op.eq]: Productid },
          },
        },
        { transactionid: t }
      );
    }
    return (
      await t.commit(),
      res.status(200).json({ message: "Transaction detail updated" })
    );
  } catch (error) {
    return await t.rollback(), res.status(400).json({ message: error.message });
  }
};

export const DeleteTransactionDetail = async (req, res) => {
  const Transactionid = req.params.transactionid;
  const { Productid } = req.body;
  const t = await database.transaction();
  try {
    if (Array.isArray(Productid)) {
      Productid.forEach((productarr) => {
        TransactionDetail.destroy(
          {
            where: {
              ProductId: { [Op.eq]: productarr },
              TransactionId: { [Op.eq]: Transactionid },
            },
          },
          { transaction: t }
        );
      });
    } else {
      TransactionDetail.destroy(
        {
          where: {
            ProductId: { [Op.eq]: Productid },
            TransactionId: { [Op.eq]: Transactionid },
          },
        },
        { transaction: t }
      );
    }
    return (
      await t.commit(),
      res.status(200).json({ message: "Transaction detail Deleted" })
    );
  } catch (error) {
    return await t.rollback(), res.status(400).json({ message: error.message });
  }
};
