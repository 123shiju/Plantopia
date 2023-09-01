const mongoose = require("mongoose");

const coupenSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    min_Purchase:{
        type:Number,
        require:true
    },
    max_Discount:{
        type:Number,
        require:true

    },
    expirationDate:{
        type:Date,
        require:true
    }
});

coupenSchema.index({code:1})
coupenSchema.index({expirationDate:1})
coupenSchema.index({min_Purchase:1})

module.exports = mongoose.model('coupen', coupenSchema);
