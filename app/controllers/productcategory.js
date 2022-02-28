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
    const BusinessId = req.params.businessid;
    const Productcategory = await ProductCategory.findAll({
      attributes: ["Id", "Name"],
      where: {
        [Op.or]: [
          {BusinessId:BusinessId},
          {BusinessId:{[Op.is]:null}}
        ],
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
    const Productcategory = await ProductCategory.findOne({
      attributes: ["Id", "Name"],
      where: {
        Id: { [Op.eq]: productcategoryid },
        BusinessId: { [Op.eq]: [businessid] },
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
          BusinessId: { [Op.or]: [businessid,{[Op.is]:null}] },
          "$ProductProductCategory.FlagTransactionType$": {[Op.eq]: transactiontypeid}
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
  const businessid = req.params.businessid
  const { name } = req.body;
  const t = await database.transaction();
  try {
    const createProductcategory = await ProductCategory.create(
      {
        BusinessId: businessid,
        Name: name,
        FlagAuto:0,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        fields: ["BusinessId", "Name", "FlagAuto", "CreatedAt", "UpdatedAt"],
      },
      { transaction: t }
    );
    return (
      await t.commit(), res.status(201).json({ result: createProductcategory })
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

    //check Category autocreted/FlagAuto = 1 is not allowed to deleted 
    const CategoryFlagAuto = await ProductCategory.findOne(
      {
        where: {
          BusinessId: {[Op.eq]:null},
          Id: {[Op.eq]:productcategoryid}
        },
      },
      { transaction: t }
    );
    if(CategoryFlagAuto.FlagAuto === 1) return (await t.rollback(), res.status(405).send({message: "AutoCreate category not allowed to deleted"}));

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
      res.status(204).json({ message: "updated successfully" })
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
     //check Category autocreted/FlagAuto = 1 is not allowed to deleted 
    const CategoryFlagAuto = await ProductCategory.findOne(
      {
        where: {
          BusinessId: {[Op.eq]:null},
          Id: {[Op.eq]:productcategoryid}
        },
      },
      { transaction: t }
    );
    if(CategoryFlagAuto.FlagAuto === 1) return (await t.rollback(), res.status(405).send({message: "AutoCreate category not allowed to deleted"}));
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
      await t.commit(), res.status(204).json({ message: "deleted successfully" })
    );
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};
