const express=require("express")
const coupenRoute=express()
const coupenController=require("../controllers/coupenController")
const path=require('path')


coupenRoute.use(express.static('public'))
coupenRoute.set('view engine','ejs')
coupenRoute.set('views','./views/coupen')
const adminauth=require('../middleware/adminAuth')

coupenRoute.get("/load_Coupen",adminauth.isLogin,coupenController.loadcoupens)
coupenRoute.get("/getaddcoupen", adminauth.isLogin,coupenController.loadAddcoupen)
coupenRoute.post("/getaddcoupen",coupenController.Addcoupen)
coupenRoute.get("/popCoupen",coupenController.popCoupens)




module.exports=coupenRoute
