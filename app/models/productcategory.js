import { Sequelize } from "sequelize";
import db from "../config/connectionDatabase.js";
import Businesses from "./businesses.js";

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
    },
    BusinessId: {
      type: DataTypes.UUID,
    },
    CreatedBy: {
      type: DataTypes.STRING,
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

// ProductCategory.associate = function (models) {
//   // define association here
//   ProductCategory.belongsTo(models.Businesses, {
//     foreignKey: "BusinessId",
//     as: "ProductCategoryBusiness",
//   });
// };
export default ProductCategory;
