import {Sequelize} from "sequelize" ;
import db from "../config/connectionDatabase.js";

const {DataTypes} = Sequelize;
const BusinessApArDetail = db.define("BusinessApArDetail",{
  BusinessApArId:{ 
    type:DataTypes.UUID
  },
  BusinessApArDetailDate:{ 
    type:DataTypes.DATE,
    defaultValue:DataTypes.NOW,
    allowNull: false
  },
  Amount:{ 
    type:DataTypes.DECIMAL,
    defaultValue:0
  },
  Description:{ 
    type:DataTypes.STRING
  },
  FlagApArIn:{ 
    type:DataTypes.INTEGER, //0 = keluar, 1 = masuk
    defaultValue:0,
    allowNull:false
  },
  CreatedBy:{ 
    type:DataTypes.STRING
  },
  CreatedAt:{ 
    type:DataTypes.DATE,
    defaultValue:DataTypes.NOW
  },
  UpdatedAt:{ 
    type:DataTypes.DATE,
    defaultValue:DataTypes.NOW
  }
},{freezeTableName:true});

BusinessApArDetail.associate = function(models) {
  // define association here
  BusinessApArDetail.belongsTo(models.BusinessApAr,{
    foreignKey: 'BusinessApArId',
    as: 'BusinessApArDetailBusinessApAr'
  });
}
export default BusinessApArDetail;