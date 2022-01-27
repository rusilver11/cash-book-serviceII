import { Sequelize } from "sequelize";
import db from "../config/connectionDatabase.js";
import Businesses from "./businesses.js";
import Persons from "./persons.js";

const { DataTypes } = Sequelize;
const BusinessApAr = db.define(
  "BusinessApAr",
  {
    Id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUID4,
    },
    PersonId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    DueDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    BusinessId:{ 
      type: DataTypes.UUID 
    },
    CreatedBy: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUID4,
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


// BusinessApAr.hasMany(models.BusinessApArDetail, {
//   foreignKey: "BusinessApArId",
//   as: "BusinessApArBusinessApArDetail",
// });
BusinessApAr.belongsTo(Businesses, {
  foreignKey: "BusinessId",
  as: "BusinessApArBusiness",
});
BusinessApAr.belongsTo(Persons, {
  foreignKey: "PersonId",
  as: "BusinessApArPerson",
});

// BusinessApAr.associate = function (models) {
//   // define association here
// };

export default BusinessApAr;
