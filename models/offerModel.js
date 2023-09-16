const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  name: String,
  category: String,
  discountType: String, 
  discountValue: Number,
  startDate: Date,
  endDate: Date,
});

module.exports = new mongoose.model('Offer', offerSchema);
