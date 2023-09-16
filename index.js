require('dotenv').config()
const express=require("express")
const app=express()
const mongoose=require("mongoose")
const port=process.env.PORT || 3000

const DBURI=process.env.MONGODB_URI
const ejs=require("ejs")
const path=require("path")
const roer = express.Router();
const nocache=require('nocache')
const cors=require('cors')

const bodyParser = require('body-parser');

app.use(nocache())
app.use(express.json());
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));



const userRoute=require('./routers/userRoute')
app.use("/",userRoute)

const adminRoute=require("./routers/adminRoute")
app.use("/admin",adminRoute)

const productRoute=require("./routers/productRoute")
app.use("/product",productRoute)

const cartRoute=require("./routers/cartRoute")
app.use("/cart",cartRoute)

const orderRoute=require("./routers/orderRoute")
app.use("/order",orderRoute)


const paymentRoute=require("./routers/paymentRoute")
app.use('/payment',paymentRoute)

const coupenRoute=require("./routers/coupenRoute")
app.use('/coupen',coupenRoute)

const invoiceRoute=require('./routers/invoiceRoute')
app.use('/invoice',invoiceRoute)

mongoose.connect(DBURI,{
  useNewUrlParser:true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

app.listen(port,()=>{
    console.log("server started at http://localhost:"+port)
})