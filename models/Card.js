// models/Card.js
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  balance: Number,
});

module.exports = mongoose.model('Card', cardSchema);
