const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');
const ProductSchema = new mongoose.Schema({
  product_name:{
    type:String,
    require:true
  },
  image:[{
    type:String,
    require:true
  
  }],
  product_category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'categoryDB',
    required: true
  },
  product_price:{
    type:Number,
    require:true
  },
  sale_price:{
    type:Number,
    require:true
  },
  stock:{
    type:Number,
    require:true
  },
  status:{
    type:String,
    require:true
  },
  discount:{
    type:Number,
    require:true
  },
  description:{
    type:String,
    require:true
  },
  special_characters:{
    type:String,
    require:true
  },
  list:{
    type:Boolean,
    default:false
  }

})
module.exports=new mongoose.model("productDB",ProductSchema)