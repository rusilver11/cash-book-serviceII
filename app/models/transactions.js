import {Sequelize} from "sequelize" ;
import db from "../config/connectionDatabase.js";
import Persons from "./persons.js";
import Businesses from "./businesses.js";

const {DataTypes} = Sequelize;
const Transactions = db.define("Transactions",{
  Id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUID4,
    primaryKey: true
  },
  TransactionDate:{ 
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  Status:{ 
    type:DataTypes.STRING
  },
  Description:{ 
    type:DataTypes.STRING
  },
  Amount:{ 
    type:DataTypes.DECIMAL,
    defaultValue:0
  },
  TransactionType:{ 
    type:DataTypes.STRING
  },
  PaymentType:{ 
    type:DataTypes.STRING
  },
  PersonId:{ 
    type:DataTypes.UUID
  },
  BusinessId:{ 
    type:DataTypes.UUID,
    allowNull: false
  },
  CreatedBy:{ 
    type:DataTypes.STRING
  },
  CreatedAt:{ 
    type:DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  UpdatedAt:{ 
    type:DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
},{freezeTableName:true});

Transactions.belongsTo(Persons,{
  foreignKey: 'PersonId',
  as: 'TransactionPerson'
});
Transactions.belongsTo(Businesses,{
  foreignKey: 'BusinessId',
  as: 'TransactionBusiness'
});  

// Transactions.associate = function(models) {
//   // define association here
//   Transactions.hasMany(models.TransactionDetail,{
//     foreignKey: 'TransactiId',
//     as: 'TransactionDetailId'
//   });
 
// };
export default Transactions;
