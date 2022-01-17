import {Sequelize} from "sequelize" ;
import db from "../config/connectionDatabase.js";
import Transactions from "./transactions.js";
import Products from "./products.js";

const {DataTypes} = Sequelize;
const TransactionDetail = db.define("TransactionDetail",{
  TransactionId:{
   type: DataTypes.UUID,
   primaryKey: true,
  },
  ProductId:{ 
   type: DataTypes.UUID,
   allowNull: false,
   foreignKey: true
  },
  Qty:{
   type: DataTypes.DECIMAL,
   defaultValue: 0
  },
  CreatedAt:{ 
   type: DataTypes.DATE
  },
  UpdatedAt:{ 
   type: DataTypes.DATE
  },
},{freezeTableName:true});

TransactionDetail.belongsTo(Transactions,{
  foreignKey: 'TransactionId',
  as: 'TransactionDetailTransaction'
});
TransactionDetail.belongsTo(Products,{
  foreignKey: 'ProductId',
  as: 'TransactionDetailProduct'
});  

export default TransactionDetail;