import {Sequelize} from "sequelize" ;
import db from "../config/connectionDatabase.js";

const {DataTypes} = Sequelize;
const Transactions = db.define("Transactions",{
  Id: {
    type: DataTypes.UUID,
    primaryKey:true,
    defaultValue: DataTypes.UUID4
  },
  TransactionAt:{ 
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  Status:{ 
    type:DataTypes.STRING
  },
  Description:{ 
    type:DataTypes.STRING
  },
  Amount:{ 
    type:DataTypes.DECIMAL
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
    type:DataTypes.UUID
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

Transactions.associate = function(models) {
  // define association here
  Transactions.hasMany(models.TransactionDetail,{
    foreignKey: 'TransactiId',
    as: 'TransactionDetailId'
  });
  Transactions.belongsTo(models.Persons,{
    foreignKey: 'PersonId',
    as: 'TransactionPerson'
  });
  Transactions.belongsTo(models.Businesses,{
    foreignKey: 'BusinessId',
    as: 'TransactionBusiness'
  });   
};
export default Transactions;
