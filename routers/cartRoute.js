const express = require('express')
const cartRoute = express()
const cartController = require('../controllers/cartController')
const auth = require('../middleware/userAuth')
const session = require("express-session")
const config = require("../config/config")

cartRoute.use(express.static('public'))
cartRoute.set('view engine', 'ejs')
cartRoute.set('views', './views/users')
cartRoute.use(session({
  secret: config.userSessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000,
  },
}))

cartRoute.get('/loadCart', cartController.loadcart)

cartRoute.get('/addToCart', auth.isLogin, auth.userblock, cartController.addToCart)
cartRoute.get('/removeProduct', auth.isLogin, auth.userblock, cartController.loadremoveProduct)
cartRoute.put('/updatequantity/:productId/:newQuantity', cartController.updatecart);
cartRoute.post('/updatecartprice', cartController.updatecartdetails)
cartRoute.post("/loadCart", cartController.applyCoupens)


module.exports = cartRoute