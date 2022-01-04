import {Sequelize} from "sequelize" ;
import db from "../config/connectionDatabase.js";

const {DataTypes} = Sequelize;
const TransactionDetail = db.define("TransactionDetail",{
  TransactionId:{
   type: DataTypes.UUID,
  },
  ProductId:{ 
   type: DataTypes.UUID
  },
  Qty:{
   type: DataTypes.DECIMAL
  },
  CreatedAt:{ 
   type: DataTypes.DATE
  },
  UpdatedAt:{ 
   type: DataTypes.DATE
  },
},{freezeTableName:true});

TransactionDetail.associate = function(models) {
  // define association here
  TransactionDetail.belongsTo(models.Transactions,{
    foreignKey: 'TransactionId',
    as: 'TransactionDetailTransaction'
  });
  TransactionDetail.belongsTo(models.Products,{
    foreignKey: 'ProductId',
    as: 'TransactionDetailProduct'
  });  
};
export default TransactionDetail;