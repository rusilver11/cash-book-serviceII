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

BusinessCategory.associate = function(models){
  BusinessCategory.hasMany(models.Businesses,{
    foreignKey: 'BusinessCategoryId',
    as: 'BusinessCategoryBusiness'
  });
};
export default BusinessCategory;