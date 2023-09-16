const orderCollection = require('../models/OrderModel')
const collection = require('../models/userModel')
var easyinvoice = require('easyinvoice');
const fs = require('fs')
const pdf = require('pdf-parse');
const path = require('path');

const downLoadInvoice = async (req, res) => {
    try {


        const user = req.session.user

        const id = req.params.orderId

        const order = await orderCollection.findOne({
            'items._id': id
        }).populate('items.product');



        const userId = order.user._id;




        const userData = await collection.findById(userId);



        const defaultShippingAddressId = userData.address.find(addr => addr.defaultValue === true)._id;

        const defaultShippingAddress = user.address.find(addr => addr._id.toString() === defaultShippingAddressId.toString());



        const item = order.items.find(item => item._id.toString() === id);





        const currentYear = new Date().getFullYear();

        let sequentialNumber = 1;


        function getNextSequentialNumber() {
            return sequentialNumber++;
        }

        const invoiceNumber = `INV-2023-${getNextSequentialNumber().toString().padStart(3, '0')}`;
        const currentDate = new Date();


        const invoiceDate = currentDate.toLocaleDateString();

        const dueDate = new Date(currentDate);
        dueDate.setDate(currentDate.getDate() + 3);

        const formattedDueDate = dueDate.toLocaleDateString();


        const logoUrl = '/company_logo.png';

        const products = [];


        order.items.forEach(orderItem => {
            products.push({
                "Name": orderItem.product_name,
                "quantity": orderItem.quantity,
                "price": orderItem.product.sale_price,
                "Total": orderItem.product.sale_price * orderItem.quantity,
                "tax-rate": 6,
            });
        });



        var data = {
            "customize": {},
            "images": {
                "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
                "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
            },
            "sender": {
                "company": "Plantopia",
                "address": "306 Plantopia enterprisers maradu,",
                "zip": "682304",
                "city": "maradu",
                "State": "Kerala",
                "country": "India"
            },
            "client": {
                "company": defaultShippingAddress.First_name + " " + defaultShippingAddress.Last_name,
                "address": defaultShippingAddress.House_name + "\n" + defaultShippingAddress.Street_number,
                "city": defaultShippingAddress.city,
                "country": defaultShippingAddress.country,
                "zip": defaultShippingAddress.Pincode
            },
            "information": {
                "number": invoiceNumber,
                "date": invoiceDate,
                "due-date": formattedDueDate
            },
            "products": products,
            "bottom-notice": "Kindly pay your invoice within 15 days.",
            "settings": {
                "currency": "INR"
            },
            "translate": {}
        };

        easyinvoice.createInvoice(data, async function (result) {
            try {
                res.setHeader('Content-Disposition', `attachment; filename="invoice.pdf"`);
                res.setHeader('Content-Type', 'application/pdf');
                res.send(Buffer.from(result.pdf, 'base64'));
               
            } catch (error) {
                console.error("Error saving invoice:", error);
            }
        });


    } catch (error) {
        res.status(500).send("error to download Invoice")
    }
}

const adminDownLoad = async (req, res) => {
    try {

    
        const orderId = req.params.orderId

    
        const orderData = await orderCollection.findOne({ 'items._id': orderId })
            .populate('user')
            .populate({
                path: 'items.product',
                model: 'productDB'
            })
            .exec();

          

        const userId = orderData.user._id


        const userData = await collection.findById(userId)


        const defaultShippingAddressId = userData.address.find(addr => addr.defaultValue === true)._id;

        const defaultShippingAddress = userData.address.find(addr => addr._id.toString() === defaultShippingAddressId.toString());

    

        const item = orderData.items.find(item => item._id.toString() === orderId);
    

        const products = [{
            "description": item.product.product_name,
            "quantity": item.quantity,
            "price": item.product.sale_price,
            "Total": item.product.sale_price * item.quantity,
            "tax-rate": 6,
        }];
        
        
       


        const currentYear = new Date().getFullYear();
    

        let sequentialNumber = 1;


        function getNextSequentialNumber() {
            return sequentialNumber++;
        }

        const invoiceNumber = `INV-2023-${getNextSequentialNumber().toString().padStart(3, '0')}`;
    
        const currentDate = new Date();
    


        const invoiceDate = currentDate.toLocaleDateString();
    

        const dueDate = new Date(currentDate);
        dueDate.setDate(currentDate.getDate() + 3);

        const formattedDueDate = dueDate.toLocaleDateString();



        const logoUrl = '/company_logo.png';

        






        var data = {
            "customize": {},
            "images": {
                "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
                "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
            },
            "sender": {
                "company": "Plantopia",
                "address": "306 Plantopia enterprisers maradu,",
                "zip": "682304",
                "city": "maradu",
                "State": "Kerala",
                "country": "India"
            },
            "client": {
                "company": defaultShippingAddress.First_name + " " + defaultShippingAddress.Last_name,
                "address": defaultShippingAddress.House_name + "\n" + defaultShippingAddress.Street_number,
                "city": defaultShippingAddress.city,
                "country": defaultShippingAddress.country,
                "zip": defaultShippingAddress.Pincode
            },
            "information": {
                "number": invoiceNumber,
                "date": invoiceDate,
                "due-date": formattedDueDate
            },
            "products": products,
            "bottom-notice": "Kindly pay your invoice within 15 days.",
            "settings": {
                "currency": "INR"
            },
            "translate": {}
        };
       

        easyinvoice.createInvoice(data, function (result) {

            res.setHeader('Content-Disposition', `attachment; filename="invoice.pdf"`);
            res.setHeader('Content-Type', 'application/pdf');
            res.send(Buffer.from(result.pdf, 'base64'));
        
        });


    } catch (error) {
        res.status(500).send("error to download Invoice")
    }
}

module.exports = {
    downLoadInvoice,
    adminDownLoad
}