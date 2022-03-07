import Products from "../models/products.js";
import TransactionDetail from "../models/transactiondetail.js";
import Sequelize from "sequelize";
import database from "../config/connectionDatabase.js";
const Op = Sequelize.Op;

export const GetAllProducts = async (req, res) => {
  try {
    const businessid = req.params.businessid;
    const transactiontype = req.params.typeid;
    const products = await Products.findAll({
      include: {
        association: "ProductProductCategory",
        attributes: ["Id", "Name"],
      },
      attributes: ["Id", "Name", "EstimatePrice", "ProductCategoryId"],
      where: {
        BusinessId: { [Op.eq]: businessid },
        FlagTransactionType: { [Op.eq]: transactiontype },
      },
      order: [["Name", "ASC"]],
    });
    return res.status(200).json(products);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: error.message });
  }
};

export const GetProduct = async (req, res) => {
  try {
    const businessid = req.params.businessid;
    const transactiontype = req.params.typeid;
    const productid = req.params.id;
    const products = await Products.findOne({
      include: {
        association: "ProductProductCategory",
        attributes: ["Id", "Name"],
      },
      attributes: ["Id", "Name", "EstimatePrice", "ProductCategoryId"],
      where: {
        Id: { [Op.eq]: productid },
        BusinessId: { [Op.eq]: businessid },
        FlagTransactionType: { [Op.eq]: transactiontype },
      }
    });
    return res.status(200).json(products);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: error.message });
  }
};

export const AddProduct = async (req, res) => {
  const BusinessId = req.params.businessid
  const {
    name,
    estprice,
    productcategoryid,
    transactiontype,
  } = req.body;
  const t = await database.transaction();
  try {
    const createProduct = await Products.create(
      {
        BusinessId: BusinessId,
        Name: name,
        EstimatePrice: estprice,
        ProductCategoryId: productcategoryid,
        TransactionType: transactiontype,
        CreatedAt: Date.now(),
        UpdatedAt: Date.now(),
      },
      {
        fields: [
          "BusinessId",
          "Name",
          "EstimatePrice",
          "ProductCategoryId",
          "TransactionType",
          "CreatedBy",
          "CreatedAt",
          "UpdatedAt",
        ],
      },
      { transaction: t }
    );
    return await t.commit(), res.status(201).json({ result: createProduct });
  } catch (error) {
    return await t.rollback(), res.status(400).send({ message: error.message });
  }
};

export const EditProduct = async (req, res) => {
  const productid = req.params.id;
  const businessid = req.params.businessid;
  const { name, estprice, productcategoryid, transactiontype } = req.body;
  const t = await database.transaction();
  try {
    await Products.update(
      {
        Name: name,
        EstimatePrice: estprice,
        ProductCategoryId: productcategoryid,
        TransactionType: transactiontype,
        UpdatedAt: Date.now(),
      },
      {
        where: {
          Id: productid,
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

export const DeleteProduct = async (req, res) => {
  const productid = req.params.id;
  const businessid = req.params.businessid;
  const t = await database.transaction();
  try {
    const checkproductuses = await TransactionDetail.findAll({
      attributes: ["TransactionId", "ProductId"],
      include: {
        association: "TransactionDetailTransaction",
        attributes: ["BusinessId"],
      },
      where: {
        ProductId: { [Op.eq]: productid },
        "$TransactionDetailTransaction.BusinessId$": { [Op.eq]: businessid },
      },
    });
    if (checkproductuses.length === 0) {
      await Products.destroy(
        {
          where: {
            Id: { [Op.eq]: productid },
            BusinessId: { [Op.eq]: businessid },
          },
        },
        { transaction: t }
      );
      return (
        await t.commit(), res.status(204).json({ message: "deleted successfully" })
      );
    } else {
      return (
        t.rollback,
        res.status(409).json({
          message:
            "Product tidak dapat dihapus karena telah terpkai di transaksi",
          result: checkproductuses,
        })
      );
    }
  } catch (error) {
    return await t.rollback(), res.status(400).json({ message: error.message });
  }
};
