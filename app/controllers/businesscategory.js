import BusinessCategory from "../models/businesscategory.js";

export const GetAllBusinesscategory = async (req, res) => {
    try {
        const Businesscategory = await BusinessCategory.findAll({
            attributes: ["Id","Name"]
        });
      return res.status(200).json(Businesscategory);
    } catch (error) {
      console.log(error);
      return res.status(400).send({message:"Business category not found"})
    }
  };

