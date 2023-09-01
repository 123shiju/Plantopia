
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'userdb' },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productDB',
        
      },
      total_price:Number,
      quantity:Number,
    },
],
sub_total:{
  type:Number,
  require:true
},
Grand_total:{
  type:Number,
  rtequire:true
},
shipping_charge:{
  type:Number,
  default:100
},
coupen:{
  type:Number,
  require:true
}
});

 

module.exports =mongoose.model('Cart', cartSchema);
