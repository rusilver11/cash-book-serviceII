import {Sequelize} from "sequelize" ;
import db from "../config/connectionDatabase.js";

const {DataTypes} = Sequelize;
const BusinessApArDetail = db.define("BusinessApArDetail",{
  BusinessApArId:{ 
    type:DataTypes.UUID
  },
  BusinessApArDetailAt:{ 
    type:DataTypes.DATE
  },
  Amount:{ 
    type:DataTypes.DECIMAL,
    defaultValue:0
  },
  Description:{ 
    type:DataTypes.STRING
  },
  ApArType:{ 
    type:DataTypes.STRING
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