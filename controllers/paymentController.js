const Razorpay = require('razorpay')
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env
const orderCollection = require("../models/OrderModel")
const cartcollection = require("../models/cartModel")

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});







const createOrder = async (req, res) => {

    const user = req.session.user;
    const cart = await cartcollection.findOne({ user: user._id }).populate('products.productId');
    if (!cart) {
        return res.status(400).json('Cart is empty');
    }

    const min = 100000;
    const max = 999999;

    const orderId = Math.floor(Math.random() * (max - min + 1)) + min;
    let orderTotal = 0;
    cart.products.forEach(item => {
        orderTotal += item.total_price;
    })
    const order = new orderCollection({
        user: user._id,
        orderId: orderId,
        items: cart.products.map(item => ({
            product: item.productId,
            quantity: item.quantity,
            price: item.total_price,
        })),
        orderTotal: cart.Grand_total,
        orderStatus: 'Placed',
    
        shipping_address: user.address[0]
    });
    await order.save();
    await cartcollection.findOneAndDelete({ user: user._id });

    const amount = cart.Grand_total * 100+100;
    const options = {
        amount: amount,
        currency: 'INR',
        receipt: 'shijukk1997@gmail.com'
    };


    razorpayInstance.orders.create(options, (err, order) => {
        if (!err) {
            return res.json({
                success: true,
                msg: "order Created",
                order_id: order.id,
                amount: amount,
                key_id: RAZORPAY_ID_KEY,
                contact: "7012995486",
                name: "shiju k",
                email: "shijukk1997@gmail.com"
            });
           
        } else {
            return res.status(400).json({ success: false, msg: 'Something went wrong' });
        }
    });
}

const loadOrderSuccess = async (req, res) => {
    try {
        const user=req.session.user
        res.render("orderSuccessFull",{user})
    } catch (error) {
        return res.status(400).json({ success: false, msg: "can't load this page" });
    }
}
module.exports = {
    loadOrderSuccess,
    createOrder
}