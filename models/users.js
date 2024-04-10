
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true }
});

const users = mongoose.model('userData', userSchema);

module.exports = users;
