const coupenCollection = require("../models/coupenModel")
const orderCollection = require("../models/OrderModel")
const cartcollection=require("../models/cartModel")


const loadcoupens = async (req, res) => {
    
    try {

       
        const coupen = await coupenCollection.find()

        res.render("coupen_page", { coupen })
    } catch (error) {

    }
}

const popCoupens = async (req, res) => {
    try {
      const user = req.session.user;
  
      const cart = await cartcollection
        .findOne({ user: user._id })
        .populate('products.productId');
  
      const coupen = await coupenCollection.find();
  
      if (cart && cart.Grand_total >= 10000) {
        res.json(coupen);
      } else if (cart && cart.Grand_total < 10000) {
        res.json({ message: "Purchase minimum 10000 !!!!!" });
      } else {
        res.status(404).json({ error: "Cart not found" });
      }
    } catch (error) {
      console.error('Error retrieving coupons:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  


const loadAddcoupen = async (req, res) => {
    try {

        res.render('add_coupen')
    } catch (error) {
        res.status(500).json("can not load coupen page")
    }
}

const Addcoupen = async (req, res) => {
    try {

        const { Coupen_Code, Discount_percentage,  min_Purchase, Max_Discount, Expiration_Date } = req.body;

        const coupen = new coupenCollection({

            code: Coupen_Code,
            discount:Discount_percentage,
            min_Purchase: min_Purchase,
            max_Discount: Max_Discount,
            expirationDate: Expiration_Date,

        })
        await coupen.save();
        if (coupen) {
            res.render("add_coupen", { message: "coupen added successfully" })
        }


    } catch (error) {
        res.status(500).json("can not add coupen page")
    }
}



module.exports = {
    loadAddcoupen,
    loadcoupens,
    Addcoupen,
    popCoupens,

}