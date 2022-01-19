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
    ApArDate: {
      type: DataTypes.DATE,
      defaultValue:DataTypes.NOW,
      allowNull:false
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
      allowNull: false,
    },
    DueDate: {
      type: DataTypes.DATE,
    },
    FlagStatusPayment: {
      type: DataTypes.INTEGER, //0 = lunas, 1 = belum lunas
    },
    FlagApArType: {
      type: DataTypes.INTEGER, //0 = hutang, 1 = Piutang
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
