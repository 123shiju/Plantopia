const Razorpay = require('razorpay')
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env
const orderCollection = require("../models/OrderModel")
const cartcollection = require("../models/cartModel")
const crypto=require('crypto')

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
        orderStatus: 'pending',

        shipping_address: user.address[0],
        payment_Method:"Online Payment"
    });
    await order.save();

    await cartcollection.findOneAndDelete({ user: user._id });

    const amount = cart.Grand_total * 100 + 100;
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

             console.log('new order:',order)

        } else {
            return res.status(400).json({ success: false, msg: 'Something went wrong' });
        }
       
    });
}

const loadOrderSuccess = async (req, res) => {
    try {
        const user = req.session.user
        res.render("orderSuccessFull", { user })
    } catch (error) {
        return res.status(400).json({ success: false, msg: "can't load this page" });
    }
}

const paymentVerification = async (req, res) => {
    try {
        const { payment_id, order_id } = req.body

    
    
        const razorpay_signature = req.headers['x-razorpay-signature']
    
        const key_secret = process.env.RAZORPAY_SECRET_KEY
    
        let hmac = crypto.createHmac('sha256', key_secret)
    
        hmac.update(order_id + "|" + payment_id)
    
        const generated_signature = hmac.digest('hex')
    
        if (razorpay_signature === generated_signature) {
            res.json({ success: true })
        } else {
            console.log("payment verification failed");
            res.json({ success: false, message: "payment verification failed" })
        }
    } catch (error) {
        return res.status(400).json({ success: false, msg: "payment verification is failed" });
    }
    
    }
   
module.exports = {
    loadOrderSuccess,
    createOrder,
    paymentVerification

}