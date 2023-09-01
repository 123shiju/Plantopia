const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userdb'
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productDB'
      },
      quantity: Number,
      price: Number
    }
  ],
  orderTotal: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  orderId: {
    type: String,
    unique: true,
  },
  orderStatus: {
    type: String,
    enum: ['Placed','Packed','Dispatched','Reached','pending','Completed','cancelled'],
    default: 'Placed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  list:{
    type:Boolean,
    default:false
  },
  shipping_address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userdb', 
    required: true
  }
 
});

module.exports =new mongoose.model('Order', orderSchema);
