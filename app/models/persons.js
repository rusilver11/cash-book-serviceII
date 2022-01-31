import { Sequelize } from "sequelize";
import db from "../config/connectionDatabase.js";

const { DataTypes } = Sequelize;
const Persons = db.define("Persons",
  {
    Id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUID4,
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    ContactId: {
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

Persons.associate = function (models) {
  Persons.belongsTo(models.Users, {
    foreignKey: "UserId",
    as: "PersonUser",
  });
};

export default Persons;
