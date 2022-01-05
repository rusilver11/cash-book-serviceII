import { Sequelize } from "sequelize";
import db from "../config/connectionDatabase.js";

const { DataTypes } = Sequelize;
const BusinessApAr = db.define(
  "BusinessApAr",
  {
    Id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUID4,
    },
    ApArAt: {
      type: DataTypes.DATE,
    },
    TotalAmount: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    Description: {
      type: DataTypes.STRING,
    },
    PersonId: {
      type: DataTypes.UUID,
    },
    DueDate: {
      type: DataTypes.DATE,
    },
    StatusPayment: {
      type: DataTypes.STRING,
    },
    ApArType: {
      type: DataTypes.STRING,
    },
    BusinessId:{ 
      type: DataTypes.UUID 
    },
    CreatedAt:{ 
      type:DataTypes.DATE,
      defaultValue:DataTypes.NOW
    },
    UpdatedAt:{ 
      type:DataTypes.DATE,
      defaultValue:DataTypes.NOW
    }
  },
  { freezeTableName: true }
);

BusinessApAr.associate = function (models) {
  // define association here
  BusinessApAr.hasMany(models.BusinessApArDetail, {
    foreignKey: "BusinessApArId",
    as: "BusinessApArBusinessApArDetail",
  });
  BusinessApAr.belongsTo(models.Businesses, {
    foreignKey: "BusinessId",
    as: "BusinessApArBusiness",
  });
  BusinessApAr.belongsTo(models.Persons, {
    foreignKey: "PersonId",
    as: "BusinessApArPerson",
  });
};
export default BusinessApAr;
