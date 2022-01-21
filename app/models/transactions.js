import { Sequelize } from "sequelize";
import db from "../config/connectionDatabase.js";
import Persons from "./persons.js";
import Businesses from "./businesses.js";
//import TransactionDetail from "./transactiondetail.js";

const { DataTypes } = Sequelize;
const Transactions = db.define(
  "Transactions",
  {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUID4,
      primaryKey: true,
    },
    TransactionDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    FlagStatus: {
      type: DataTypes.INTEGER, //0 = lunas, 1 = belum lunas
      defaultValue: 0,
      allowNull: false,
      validate: {
        isIn: [[0, 1]],
      },
    },
    Description: {
      type: DataTypes.STRING,
    },
    AmountIn: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    AmountOut: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    FlagTransactionType: {
      type: DataTypes.INTEGER, //0 = pemasukan, 1 = pengeluaran
      defaultValue: 0,
      allowNull: false,
      validate: {
        isIn: [[0, 1]],
      },
    },
    PaymentType: {
      type: DataTypes.STRING,
    },
    PersonId: {
      type: DataTypes.UUID,
    },
    BusinessId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    CreatedBy: {
      type: DataTypes.STRING,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { freezeTableName: true }
);

Transactions.belongsTo(Persons, {
  foreignKey: "PersonId",
  as: "TransactionPerson",
});
Transactions.belongsTo(Businesses, {
  foreignKey: "BusinessId",
  as: "TransactionBusiness",
});

// Transactions.associate = function(models) {
//   // define association here
//   Transactions.hasMany(models.TransactionDetail,{
//     foreignKey: 'TransactiId',
//     as: 'TransactionTransactionDetail'
//   });
// };
export default Transactions;
