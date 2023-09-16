const express=require('express')
invoice_Route=express()
const InvoiceController=require('../controllers/InvoiceController')


const bodyParser=require('body-parser')
invoice_Route.use(bodyParser.json())
invoice_Route.use(bodyParser.urlencoded({extended:false}));

const path=require('path')
const auth=require('../middleware/userAuth')
// const { default: invoices } = require('razorpay/dist/types/invoices')

invoice_Route.get('/download_Invoice/:orderId',InvoiceController.downLoadInvoice)
invoice_Route.get('/AdminInvoiceDownload/:orderId',InvoiceController.adminDownLoad)

module.exports=invoice_Route