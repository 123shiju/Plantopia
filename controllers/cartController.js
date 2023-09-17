const collection = require("../models/userModel")
const productcollection = require("../models/productModel")
const categorycollection = require("../models/categoryModel")
const cartcollection = require("../models/cartModel")
const coupenCollection = require("../models/coupenModel")




const addToCart = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.redirect('/login');
    }

    const productId = req.query.id;
  
    const product = await productcollection.findById(productId);
    


    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (product.stock === 0) {
      return res.status(400).json({ error: 'Product is out of stock.' });
    }

    let cart = await cartcollection.findOne({ user: user._id }).populate('products.productId');
    console.log("cart products:",cart)
    if (!cart) {
      cart = new cartcollection({ user: user._id, products: [], sub_total: 0, Grand_total: 0 });
    }

    const existingProduct = cart.products.find(p => p.productId && p.productId.equals(productId));
    if (existingProduct) {
      const totalQuantity = existingProduct.quantity + 1;
      if (totalQuantity > product.stock) {
        return res.status(400).json({ error: 'Adding more quantity exceeds available stock.' });
      }
      existingProduct.quantity++;
      existingProduct.total_price = existingProduct.productId.sale_price * existingProduct.quantity;
    } else {
      if (1 > product.stock) {
        return res.status(400).json({ error: 'Adding this product exceeds available stock.' });
      }
      cart.products.push({ productId: productId, quantity: 1, total_price: product.sale_price });
    }

    product.stock--;

    let subTotal = 0;
    cart.products.forEach(item => {
      subTotal += item.total_price;
    });

    cart.sub_total = subTotal;


    if (req.session.coupon) {

      cart.Grand_total = subTotal + cart.shipping_charge - req.session.coupon.discount;
    } else {
      cart.Grand_total = subTotal + cart.shipping_charge;
    }

    const cartItems = cart.products.map(item => {
      const productData = item.productId;

      const total_price = item.quantity * (productData ? productData.sale_price : 0);
      let image = 'No Image Available';
      if (productData && productData.image && productData.image.length > 0) {
        image = productData.image[0];
      }
      return {
        productId: productData ? productData._id : null,
        name: productData ? productData.product_name : 'Product Name Not Available',
        price: productData ? productData.sale_price : 0,
        quantity: item.quantity,
        image: image,
        total_price: total_price,
        shipping_charge: cart.shipping_charge,
        stock: productData ? productData.stock : 0
      };
    });


    await Promise.all([cart.save(), product.save()]);
    res.redirect('/cart/loadCart');
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
};








const loadcart = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.redirect('/login');
    }

    const cart = await cartcollection
      .findOne({ user: user._id })
      .populate('products.productId');

    if (!cart || cart.products.length === 0) {
      return res.render('cart', { cartItems: [], user });
    }


    let subTotal = 0;
    cart.products.forEach(item => {
      subTotal += item.total_price;
    });

    const coupen = await coupenCollection.find();

  

    const coupon = req.session.coupon;
    let couponDiscount = 0;
    if (coupon) {
      couponDiscount = coupon.discount;
    
    }


    const grandTotal = coupon ? subTotal + cart.shipping_charge - couponDiscount : subTotal + cart.shipping_charge;

    const cartItems = cart.products.map(item => {
      const productData = item.productId;
      const total_price = item.quantity * (productData ? productData.sale_price : 0);
      return {
        productId: productData ? productData._id : null,
        name: productData ? productData.product_name : 'Product Name Not Available',
        price: productData ? productData.sale_price : 0,
        quantity: item.quantity,
        image: productData && productData.image.length > 0 ? productData.image[0] : 'No Image Available',
        total_price: total_price,
        shipping_charge: cart.shipping_charge
      };
    });
  

    res.render('cart', { cartItems, user, cart, coupen, grandTotal });
  } catch (error) {
    console.error('Error loading cart:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
};







const loadremoveProduct = async (req, res) => {
  try {
    const productIdToRemove = req.query.id.toString();
    const user = req.session.user;

    let cart = await cartcollection.findOne({ user: user._id }).populate('products.productId');

    const removedProductIndex = cart.products.findIndex(item => item.productId._id.toString() === productIdToRemove);

    if (removedProductIndex !== -1) {
      const removedProduct = cart.products[removedProductIndex];

      if (
        !isNaN(removedProduct.total_price) &&
        !isNaN(cart.sub_total) &&
        !isNaN(cart.Grand_total) &&
        typeof removedProduct.total_price === 'number' &&
        typeof cart.sub_total === 'number' &&
        typeof cart.Grand_total === 'number'
      ) {

        const removedProductTotalPrice = parseFloat(removedProduct.total_price);
        const cartSubTotal = parseFloat(cart.sub_total);
        const cartGrandTotal = parseFloat(cart.Grand_total);

        if (!isNaN(removedProductTotalPrice) && !isNaN(cartSubTotal) && !isNaN(cartGrandTotal)) {
          const productToUpdate = await productcollection.findById(removedProduct.productId._id);

          if (productToUpdate) {

            productToUpdate.stock += removedProduct.quantity;
            await productToUpdate.save();
          }

          cart.products.splice(removedProductIndex, 1);
          cart.sub_total = cartSubTotal - removedProductTotalPrice;
          cart.Grand_total = cartGrandTotal - removedProductTotalPrice;

          await cart.save();

          return res.redirect('/cart/loadCart');
        } else {
          console.log("Invalid values for subtraction after conversion");
        }
      } else {
        console.log("Invalid values for subtraction before conversion");
      }
    } else {
      console.log("Can't remove product");
    }

    return res.redirect('/cart/loadCart');
  } catch (error) {
    console.error('Error removing product:', error);
    return res.redirect('/cart/loadCart');
  }
};














const updatecart = async (req, res) => {
  try {
    const { productId, newQuantity } = req.params;


    const user = req.session.user;

    const cart = await cartcollection
      .findOne({ user: user._id })
      .populate('products.productId');

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId._id.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    const productInCart = cart.products[productIndex];
    const oldQuantity = productInCart.quantity;

    const productData = productInCart.productId;

    if (productData.stock === 0 && parseInt(newQuantity) > oldQuantity) {
      return res.json({ product: productInCart });
    }

    if (newQuantity) {
      const quantityDifference = parseInt(newQuantity) - oldQuantity;

      if (quantityDifference > 0) {
        if (productData.stock < quantityDifference) {
          return res.status(400).json({ error: 'Not enough stock' });
        }
        productData.stock -= quantityDifference;
      } else if (quantityDifference < 0) {
        productData.stock += Math.abs(quantityDifference);
      }

      await productData.save();

      productInCart.total_price = productData.sale_price * productInCart.quantity;
      productInCart.quantity = parseInt(newQuantity);
    } else {
      return res.status(400).json({ error: 'Invalid quantity or product is out of stock' });
    }

    let subTotal = 0;
    let grandTotal = 0;

    for (let product of cart.products) {
      product.total_price = product.productId.sale_price * product.quantity;
      subTotal += product.total_price;
      grandTotal += product.total_price;
    }

    cart.sub_total = subTotal + cart.shipping_charge;
    cart.Grand_total = grandTotal + cart.shipping_charge;

    await cart.save();

    res.json({ product: productInCart });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};








const updatecartdetails = async (req, res) => {
  try {

    const { cartdata } = req.body


    const userId = req.session.user._id

    let cart = await cartcollection.findById(userId)
    if (!cart) {
      cart = new cartcollection({

        user: userId,
        products: [],
        sub_total: 0,
        Grand_total: 0
      })
    }

    cart.products = cartdata.products
    cart.sub_total = cartdata.sub_total
    cart.Grand_total = cartdata.Grand_total + cart.shipping_charge

    await cart.save()

    res.redirect('/oder/checkout')

  } catch (error) {
    res.status(500).json({ error: 'can not update Cart details' })
  }
}

const applyCoupens = async (req, res) => {
  try {
    const { couponCode, grand_total } = req.body;
    const code = req.body.couponCode;


    const user = req.session.user;

    const cart = await cartcollection
      .findOne({ user: user._id })
      .populate('products.productId');
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const coupen = await coupenCollection.findOne({ code: code });

    if (!coupen) {
      return res.status(400).json({ error: 'Coupon code is invalid' });
    }

    const coupenvalue = coupen.discount;

    const currentDate = new Date();

    if (coupen.expirationDate && currentDate > new Date(coupen.expirationDate)) {
      console.log("date checking")
      return res.status(400).json({ error: 'Coupon has expired' });
    }




    if (grand_total < 10000) {
      return res.status(400).json({ error: 'Coupon is not applicable for this order total' });
    }


    if (coupenvalue) {
      cart.coupen = coupenvalue
    }

    if (!coupen) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    if (grand_total < coupen.min_Purchase) {
      return res.status(400).json({ error: 'Grand total is less than minimum purchase required for the coupon' });
    }


    const numericGrandTotal = parseFloat(grand_total.replace(/[^0-9.-]+/g, ""));
    const numericCouponDiscount = parseFloat(coupen.discount);


    if (isNaN(numericGrandTotal) || isNaN(numericCouponDiscount)) {
      return res.status(400).json({ error: 'Invalid numeric values' });
    }


    const newGrandTotal = numericGrandTotal - numericCouponDiscount;

    cart.Grand_total = newGrandTotal;



    await cart.save();
    await coupenCollection.deleteOne({ code: couponCode });




    res.json({ updatedTotal: cart.Grand_total, coupen: coupen });
  } catch (error) {
    res.status(500).json({ error: 'Unable to apply coupon' });
  }
};






module.exports = {
  addToCart,
  loadcart,
  loadremoveProduct,
  updatecart,
  updatecartdetails,
  applyCoupens

}