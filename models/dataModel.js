const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    serialNumber: String,
    registerNumber: String,
    studentname: String,
    batch: String,
    department: String,
    contact: String,
    studentEmail: String,
    undertaking: String
});

const Data = mongoose.model('studentList', dataSchema);

module.exports = Data;
