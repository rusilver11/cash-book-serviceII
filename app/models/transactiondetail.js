import { Sequelize } from "sequelize";
import db from "../config/connectionDatabase.js";
import Transactions from "./transactions.js";
import Products from "./products.js";

const { DataTypes } = Sequelize;
const TransactionDetail = db.define(
  "TransactionDetail",
  {
    Id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUID4,
    },
    TransactionId: {
      type: DataTypes.UUID,
      foreignKey: true,
    },
    ProductId: {
      type: DataTypes.UUID,
      allowNull: false,
      foreignKey: true,
    },
    Qty: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now()
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now(),
      onUpdate: Date.now()
    },
  },
  { freezeTableName: true }
);

TransactionDetail.removeAttribute("id");

TransactionDetail.belongsTo(Transactions, {
  foreignKey: "TransactionId",
  as: "TransactionDetailTransaction",
});

TransactionDetail.belongsTo(Products, {
  foreignKey: "ProductId",
  as: "TransactionDetailProduct",
});

export default TransactionDetail;
