const mongoose=require('mongoose')


const adminschema=new mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        require:true
    }
})
module.exports=new mongoose.model('admindb',adminschema)