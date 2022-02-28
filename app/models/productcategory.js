import { Sequelize } from "sequelize";
import db from "../config/connectionDatabase.js";
import Businesses from "./businesses.js";
// import Products from "./products.js";

const { DataTypes } = Sequelize;
const ProductCategory = db.define(
  "ProductCategory",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull:false
    },
    BusinessId: {
      type: DataTypes.UUID,
      allowNull:false
    },
    FlagAuto:{
      type: DataTypes.INTEGER,
      validate: {
        isIn: [[0, 1]],
      },
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { freezeTableName: true }
);

ProductCategory.belongsTo(Businesses, {
  foreignKey: "BusinessId",
  as: "ProductCategoryBusiness",
});
// ProductCategory.hasMany(Products, {
//   foreignKey: "ProductCategoryId",
//   as: "ProductProductCategory",
// });

// ProductCategory.associate = function (models) {
//   // define association here
//   ProductCategory.belongsTo(models.Businesses, {
//     foreignKey: "BusinessId",
//     as: "ProductCategoryBusiness",
//   });
// };
export default ProductCategory;
