const mongoose=require("mongoose")
const userschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    otp:{
        type:Number,
    },
    blocked: {
        type:Boolean,
        default: false,
      },
      is_Verified: {
        type: Boolean,
        default: false,
      },
      
    mobileNO:{
        type:Number,
        require:true
    },
    otpExpiration: {
        type: Date 
    },
    address:[{
        First_name:{
            type:String,
            require:true
        },
        Last_name:{
            type:String,
            require:true
        },
        Email_address:{
            type:String,
            require:true
        },
        Mobile:{
            type:Number,
            require:true
        },
        House_name:{
            type:String,
            require:true
        },
        Street_number:{
            type:String,
            require:true
        },
        town:{
            type:String,
            require:true
        },
        city:{
            type:String,
            require:true
        },
        state:{
            type:String,
            require:true
        },
        country:{
            type:String,
            require:true
        },
        Pincode:{
            type:Number,
            require:true
        },
        defaultValue:{
            type:Boolean,
            default:true
        }
    }]
    
})

module.exports=new mongoose.model("userdb",userschema)