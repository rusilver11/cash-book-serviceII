import { Sequelize } from "sequelize";
import db from "../config/connectionDatabase.js";

const { DataTypes } = Sequelize;
const Products = db.define(
  "Products",
  {
    Id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUID4,
    },
    Name: {
      type: DataTypes.STRING,
    },
    TransactionType: {
      type: DataTypes.STRING,
    },
    ProductCategoryId: {
      type: DataTypes.INTEGER,
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

Products.associate = function (models) {
  // define association here
  Products.hasMany(models.TransactionDetail, {
    foreignKey: "ProductId",
    as: "ProductTransactionDetail",
  });
  Products.belongsTo(models.Businesses, {
    foreignKey: "BusinessId",
    as: "ProductBusiness",
  });
  Products.belongsTo(models.ProductCategory, {
    foreignKey: "ProductCategoryId",
    as: "ProductProductCategory",
  });
};
export default Products;
