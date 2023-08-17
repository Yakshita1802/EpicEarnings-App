const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  verificationToken: String, // This field will store the verification token
});

module.exports = mongoose.model('User', userSchema);
