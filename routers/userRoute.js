const express = require("express")
const user_route = express()
const userController = require('../controllers/userControllers')
const path = require("path")
const session = require("express-session")
const config = require("../config/config")
const auth = require('../middleware/userAuth')
const flash = require('express-flash');




user_route.use(express.static('public'))
user_route.use(flash())
user_route.set('view engine', 'ejs')
user_route.set('views', './views/users')
user_route.use(session({
  secret: config.userSessionSecret,
  resave: false,
  saveUninitialized: false,
}))


user_route.get('/', userController.loadHome);
user_route.get('/register', auth.isLogout, userController.loadRegister);
user_route.post('/register', userController.insertuser);
user_route.get('/login', auth.isLogout, userController.loginLoad)
user_route.get('/OTP', auth.isLogout, userController.loadOTP)
user_route.post('/OTP', userController.verifyOTP)
user_route.post('/register', userController.verifyOTP);
user_route.post('/login', userController.verifyLogin)
user_route.get('/shop', userController.loadshop);
user_route.get('/productdetails', userController.productdetails)
user_route.get('/logout', auth.userblock, auth.isLogin, auth.userblock, userController.userLogout)
user_route.post('/resend', userController.otpResend)
user_route.get('/about', userController.getAbout)
user_route.get('/blog', userController.getBlog)
user_route.get('/profile',auth.userblock, auth.isLogin,userController.getProfille)
user_route.get('/wishlist',auth.userblock, auth.isLogin,userController.addwishList)
user_route.get('/getwishList',auth.userblock, auth.isLogin,userController.wishList)
user_route.get('/removewishlistProduct',auth.userblock, auth.isLogin,userController.RemoveWishList)
user_route.get('/editProfile',auth.userblock, auth.isLogin,userController.GeteditProfile)
user_route.post('/editProfile',auth.userblock, auth.isLogin,userController.updateProfile)




module.exports = user_route