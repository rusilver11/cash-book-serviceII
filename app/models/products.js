import { Sequelize } from "sequelize";
import db from "../config/connectionDatabase.js";
import ProductCategory from "./productcategory.js";
import Businesses from "./businesses.js";

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
    FlagTransactionType: {
      type: DataTypes.INTEGER, //0 = pemasukan, 1 = pengeluaran
      defaultValue: 0,
      allowNull:false,
      validate:{
        isIn:[[0,1]],
      }
    },
    ProductCategoryId: {
      type: DataTypes.INTEGER,
    },
    EstimatePrice: {
      type: DataTypes.INTEGER,
      defaultValue:0,
    },
    BusinessId: {
      type: DataTypes.UUID,
      allowNull:false
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

Products.belongsTo(Businesses, {
  foreignKey: "BusinessId",
  as: "ProductBusiness",
});
Products.belongsTo(ProductCategory, {
  foreignKey: "ProductCategoryId",
  as: "ProductProductCategory",
});

Products.associate = function (models) {
  // define association here
  Products.hasMany(models.TransactionDetail, {
    foreignKey: "ProductId",
    as: "ProductTransactionDetail",
  });
};
export default Products;
