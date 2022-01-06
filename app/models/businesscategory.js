import {Sequelize} from "sequelize";
import db from "../config/connectionDatabase.js";

const {DataTypes} = Sequelize;
const BusinessCategory = db.define("BusinessCategory",{
  Id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement:true
  },
  Name:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  CreatedAt:{
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  UpdatedAt:{
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
},{freezeTableName:true});

// BusinessCategory.hasMany(Businesses,{
//   as: 'BusinessCategoryBusiness',
//   foreignKey: 'BusinessCategoryId'
// });

// BusinessCategory.associate = (models) => {
//   BusinessCategory.hasMany(models.Businesses,{
//     as: 'BusinessCategoryBusiness',
//     foreignKey: 'BusinessCategoryId'
//   });
// };

export default BusinessCategory;

