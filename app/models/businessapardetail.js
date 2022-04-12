import {Sequelize} from "sequelize" ;
import db from "../config/connectionDatabase.js";

const {DataTypes} = Sequelize;
const BusinessApArDetail = db.define("BusinessApArDetail",{
  Id:{ 
    type:DataTypes.UUID,
    primaryKey:true,
    defaultValue:DataTypes.UUID4
  },
  BusinessApArId:{ 
    type:DataTypes.UUID,
    foreignKey:true,
    allowNull:false
  },
  ApArDate:{ 
    type:DataTypes.DATE,
    defaultValue:DataTypes.NOW,
    allowNull: false
  },
  ApAmount:{ 
    type:DataTypes.DECIMAL,
    defaultValue:0
  },
  ArAmount:{ 
    type:DataTypes.DECIMAL,
    defaultValue:0
  },
  Description:{ 
    type:DataTypes.STRING
  },
  FlagApArIn:{ 
    type:DataTypes.INTEGER, //0 = keluar, 1 = masuk
    defaultValue:0,
    allowNull:false,
    validate:{
      isIn:[[0,1]]
    }
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