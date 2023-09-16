const express=require("express")
const payment_route=express()


const bodyParser=require('body-parser')
payment_route.use(bodyParser.json())
payment_route.use(bodyParser.urlencoded({extended:false}));

const path=require('path')
const auth=require('../middleware/userAuth')

payment_route.set('view engine','ejs')
payment_route.set('views', './views/users')

const paymentController=require('../controllers/paymentController')


payment_route.post('/createOrder',paymentController.createOrder)
payment_route.get('/orderSucessfull',auth.isLogin,auth.userblock,paymentController.loadOrderSuccess)
payment_route.post('/verifyPayment',paymentController.paymentVerification)
module.exports=payment_route