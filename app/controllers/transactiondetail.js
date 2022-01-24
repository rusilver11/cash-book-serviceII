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

export const EditTransactionDetail = async (req, res) => {
  const Transactionid = req.params.transactionid;
  const { Productid, Qty } = req.body;
  const t = await database.transaction();
  try {
    if (Array.isArray(Productid)) {
      for (let i = 0; i < Productid.length; i++) {
        if (Qty[i] == 0) {
          await TransactionDetail.destroy(
            {
              where: {
                TransactionId: Transactionid,
                ProductId: Productid[i],
              },
            },
            { transaction: t }
          );
        } else {
          await TransactionDetail.update(
            {
              Qty: Qty[i],
              UpdateAt: Date.now(),
            },
            {
              where: {
                TransactionId: Transactionid,
                ProductId: Productid[i],
              },
            },
            { transactionid: t }
          );
        }
      }
    } else {
      await TransactionDetail.update(
        {
          Qty: Qty,
          UpdateAt: Date.now(),
        },
        {
          where: {
            TransactionId: Transactionid,
            ProductId: Productid,
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
