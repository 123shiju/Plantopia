const mongoose=require("mongoose")

const wishListSchema=new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'productDB'
    }
})


module.exports=new mongoose.model("wishList",wishListSchema)