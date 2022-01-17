import ProductCategory from "../models/productcategory.js";
import Products from "../models/products.js";
import Sequelize from "sequelize";
import database from "../config/connectionDatabase.js";

const Op = Sequelize.Op;

//associate
ProductCategory.hasMany(Products, {
  foreignKey: "ProductCategoryId",
  as: "ProductProductCategory",
})

export const GetAllProductcategory = async (req, res) => {
  try {
    const businessid = req.params.id;
    const Productcategory = await ProductCategory.findAll({
      attributes: ["Id", "Name"],
      where: {
        BusinessId: { [Op.eq]: businessid },
      },
      order: [["Name", "ASC"]],
    });
    return res.status(200).json(Productcategory);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: error.message });
  }
};

export const GetProductcategory = async (req, res) => {
  try {
    const businessid = req.params.businessid;
    const productcategoryid = req.params.id
    const Productcategory = await ProductCategory.findAll({
      attributes: ["Id", "Name"],
      where: {
        Id: { [Op.eq]: productcategoryid },
        BusinessId: { [Op.eq]: businessid },
      },
    });
    return res.status(200).json(Productcategory);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: error.message});
  }
};

export const GetAllProductsGroupByCategory = async (req, res) => {
    try {
      const businessid = req.params.businessid;
      const transactiontypeid = req.params.typeid;
      const products = await ProductCategory.findAll({
        attributes: ["Id","Name"],
        include: {
            association: "ProductProductCategory",
            attributes: ["Id", "Name", "EstimatePrice", "ProductCategoryId"]
        },
        where: {
          BusinessId: { [Op.eq]: businessid },
          "$ProductProductCategory.TransactionType$": {[Op.or]: [transactiontypeid,2]}
        },
        order: [["Name", "ASC"]],
      });
      return res.status(200).json(products);
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error.message });
    }
  };

export const AddProductCategory = async (req, res) => {
  const { businessid, userid, name } = req.body;
  const t = await database.transaction();
  try {
    const createProductcategory = await ProductCategory.create(
      {
        BusinessId: businessid,
        CreatedBy: userid,
        Name: name,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        fields: ["BusinessId", "CreatedBy", "Name", "CreatedAt", "UpdatedAt"],
      },
      { transaction: t }
    );
    return (
      await t.commit(), res.status(200).json({ result: createProductcategory })
    );
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};

export const EditProductCategory = async (req, res) => {
  const productcategoryid = req.params.id;
  const businessid = req.params.businessid;
  const { name } = req.body;
  const t = await database.transaction();
  try {
    await ProductCategory.update(
      {
        Name: name,
        UpdatedAt: Date.now(),
      },
      {
        where: {
          Id: productcategoryid,
          BusinessId: businessid,
        },
      },
      { transaction: t }
    );
    return (
      await t.commit(),
      res.status(200).json({ message: `Product category ${name} updated` })
    );
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};

export const DeleteProductCategory = async (req, res) => {
  const productcategoryid = req.params.id;
  const businessid = req.params.businessid;
  const t = await database.transaction();
  try {
    //check category currently uses in product
    const CategoryInUse = await Products.findAll(
      {
        where: {
          ProductCategoryId: productcategoryid,
          BusinessId: businessid,
        },
      },
      { transaction: t }
    );
    if (CategoryInUse) {
      //change product category id to to default on product before delete cuz user just want delete a category
      const DefaultId = await ProductCategory.findOne(
        {
          where: {
            BusinessId: businessid,
          },
        },
        { transaction: t }
      );
      await Products.update(
        {
          ProductCategoryId: DefaultId.Id,
          UpdatedAt: Date.now(),
        },
        {
          where: {
            ProductCategoryId: productcategoryid,
            BusinessId: businessid,
          },
        },
        { transaction: t }
      );
    }
    //then deleted
    await ProductCategory.destroy(
      {
        where: {
          Id: productcategoryid,
          BusinessId: businessid,
        },
      },
      { transaction: t }
    );
    return (
      await t.commit(), res.status(200).json({ message: "Product category deleted" })
    );
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};
