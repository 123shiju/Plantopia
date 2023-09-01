const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        require: true,
        unique: true, 
        collation: { locale: 'en', strength: 2 }
    }
})

module.exports = new mongoose.model('categoryDB', categorySchema)