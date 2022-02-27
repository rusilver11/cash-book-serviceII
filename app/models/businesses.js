import {Sequelize} from "sequelize" ;
import db from "../config/connectionDatabase.js";
import BusinessCategory from "./businesscategory.js";
import Users from "./users.js";

const {DataTypes} = Sequelize;
const Businesses = db.define("Businesses",{
    Id:{
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUID4
    },
    UserId:{
      type: DataTypes.UUID,
      allowNull: false
    },
    Name:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    BusinessCategoryId:{
      type: DataTypes.INTEGER,
      allowNull: true
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

Businesses.belongsTo(BusinessCategory,{
  foreignKey: 'BusinessCategoryId',
  as: 'BusinessCategory'
});
Businesses.belongsTo(Users,{
  foreignKey: 'UserId',
  as: 'BusinessUser'
});
// Businesses.hasMany(models.Products,{
//   foreignKey: 'BusinessId',
//   as: 'BusinessProducts'
// });
// Businesses.hasMany(models.ProductCategory,{
//   foreignKey: 'BusinessId',
//   as: 'BusinessProductCategory'
// });
// Businesses.hasMany(models.Transactions,{
//   foreignKey: 'BusinessId',
//   as: 'BusinessTransaction'
// });
// Businesses.hasMany(models.BusinessApAr,{
//   foreignKey: 'BusinessId',
//   as: 'BusinessBusinessApAr'
// });

export default Businesses;



