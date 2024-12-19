const mongoose = require('mongoose');
const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  media: {
    type: String,
    required: true,
  },
  media1: {
    type: String,
    required: true, 
  },
  goal: {
    type: Number,
    required: true,
  },
  deadline: {
    type: Date,
    required: true, 
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  amountRaised: {
    type: Number,
    default: 0, 
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
});
module.exports = mongoose.model('Campaign', campaignSchema);
