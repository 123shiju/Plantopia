const express=require("express")
const product_route=express()
const productController=require('../controllers/productController')
const adminauth=require('../middleware/adminAuth')

product_route.set('view engine','ejs')
product_route.set('views','./views/admin')
product_route.use(express.static('public'))
const bodyparser=require('body-parser')
product_route.use(bodyparser.json())
product_route.use(bodyparser.urlencoded({extended:true}))

const multer = require("multer");
const path = require("path"); 
const toastr = require("toastr");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/productImages'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);

  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});



product_route.get('/',adminauth.isLogin,productController.loadHome);
product_route.get('/add_product',adminauth.isLogin,productController.addProduct);
product_route.post('/add_product',upload.array('image', 5),productController.addProductDetails);
product_route.get('/edit_product',adminauth.isLogin,productController.editProductLoad)
product_route.post('/edit_product',upload.array('image',5),productController.updateproduct)
product_route.get('/delete_product',adminauth.isLogin,productController.deleteproduct)
product_route.get('/zoom',adminauth.isLogin,productController.ZoomImage)
product_route.get('/productsFilter',adminauth.isLogin,productController.loadproductsFilter)
product_route.get('/DeleteImage',adminauth.isLogin,productController.deleteimage)

module.exports=product_route;