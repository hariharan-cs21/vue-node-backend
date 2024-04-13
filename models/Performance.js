const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assessmentsCompleted: [{
        assessmentName: {
            type: String,
            required: true
        },
        dateCompleted: {
            type: Date,
            required: true
        },
        marks: {
            type: Number,
            required: true
        }
    }]
});

const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;
