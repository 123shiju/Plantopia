const express=require("express")
const admin_route=express()
const adminController=require("../controllers/adminController")
const config=require("../config/config")
const session=require("express-session")
const adminAuth=require('../middleware/adminAuth')
const flash = require('express-flash');

admin_route.use(express.static('public'))
admin_route.set("view engine",'ejs')
admin_route.set('views','./views/admin')
admin_route.use(flash())

admin_route.use( session({
    secret: config.adminSessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  }))


admin_route.get('/',adminAuth.isLogout,adminController.loadLogin)
admin_route.post('/',adminController.verifyLogin)
admin_route.get('/home', adminAuth.isLogin,adminController.loadDashboard)
admin_route.get('/product',adminAuth.isLogin,adminController.loadproduct_page)
admin_route.get('/user',adminAuth.isLogin,adminController.loaduser)
admin_route.get('/block', adminAuth.isLogin,adminController.Blockuser)
admin_route.get('/unblock', adminAuth.isLogin,adminController.UnBlockuser)
admin_route.get('/category', adminAuth.isLogin,adminController.loadCategory)
admin_route.post('/category',adminController.addCategory)
admin_route.get('/editCategory', adminAuth.isLogin,adminController.loadeditCategory)
admin_route.post('/editCategory', adminAuth.isLogin,adminController.updateCategory)
admin_route.get('/delete_category',adminAuth.isLogin,adminController.delete__category)
admin_route.get('/logout', adminAuth.isLogin,adminController.loadlogout)
admin_route.get('/Cancel_order', adminAuth.isLogin,adminController.Cancelorder)
admin_route.get('/order_details',adminAuth.isLogin,adminController.getorderDetails)
admin_route.get('/addOffer',adminAuth.isLogin,adminController.GetOffer_page)
admin_route.post('/addOffer',adminController.ApplyOffer)
admin_route.get('/GetorderReport',adminAuth.isLogin,adminController.GetOrder_Report)
admin_route.get('/DownloadSalesReport',adminAuth.isLogin,adminController.Download_SalesReport)
module.exports=admin_route