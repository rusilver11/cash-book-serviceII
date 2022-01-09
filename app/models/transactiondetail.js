import {Sequelize} from "sequelize" ;
import db from "../config/connectionDatabase.js";
import Transactions from "./transactions.js";
import Products from "./products.js";

const {DataTypes} = Sequelize;
const TransactionDetail = db.define("TransactionDetail",{
  TransactionId:{
   type: DataTypes.UUID,
  },
  ProductId:{ 
   type: DataTypes.UUID
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

TransactionDetail.belongsTo(models.Transactions,{
  foreignKey: 'TransactionId',
  as: 'TransactionDetailTransaction'
});
TransactionDetail.belongsTo(models.Products,{
  foreignKey: 'ProductId',
  as: 'TransactionDetailProduct'
});  

export default TransactionDetail;