const express=require("express")
orderRoute=express()
const orderController=require("../controllers/orderContoller")
const auth=require('../middleware/userAuth')
orderRoute.use(express.static('public'))
orderRoute.set('view engine','ejs')
orderRoute.set('views','./views/users')


orderRoute.get('/checkOut',auth.isLogin,auth.userblock,orderController.loadCheckout)
orderRoute.post('/checkOut',orderController.addDetails)
orderRoute.post('/getNewaddress',orderController.addDetails)
orderRoute.get('/payment',auth.isLogin,auth.userblock,orderController.loadPayment)
orderRoute.post('/payment',orderController.orderSuccess)
orderRoute.get('/getNewaddress',auth.isLogin,auth.userblock,orderController.addNewAddress)
orderRoute.get('/status',auth.isLogin,auth.userblock,orderController.loadStatus)
orderRoute.get('/loadstatus',auth.isLogin,auth.userblock,orderController.showStatus)
orderRoute.post('/cancel', orderController.cancelOrder);
orderRoute.get('/getEdit_address',auth.isLogin,auth.userblock,orderController.load_editAddress)
orderRoute.post('/getEdit_address',orderController.updateAddress)
orderRoute.get('/getDeaultAddress',auth.isLogin,orderController.loadDefaultAddress)
orderRoute.get('/delete_address',auth.isLogin,auth.userblock,orderController.loadDelete_address)
orderRoute.post("/makeDefault",orderController.makeDefaultAddress)
orderRoute.get('/orderDetails',auth.isLogin,auth.userblock,orderController.loadorderDetails)
orderRoute.get('/ordersuccess',auth.isLogin,auth.userblock,orderController.orderSuccess)
orderRoute.get('/OrderFullDetails',auth.isLogin,auth.userblock,orderController.loadOrderFullDetails)



module.exports=orderRoute