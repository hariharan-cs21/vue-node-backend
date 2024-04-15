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
        },
        totalMarks: {
            type: Number,
            required: true
        },
        averageMarks: {
            type: Number,
            required: true
        },
        attendancePercentage: {
            type: Number,
            required: true
        },
        comments: {
            type: String
        }
    }]
});

const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;
