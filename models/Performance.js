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
        },
        dateCompleted: {
            type: Date,
        },
        marks: {
            type: Number,
        },
        totalMarks: {
            type: Number,
        },
        averageMarks: {
            type: Number,
        },
        attendancePercentage: {
            type: Number,
        },
        comments: {
            type: String
        }
    }],
    fullStackProjectLevel: {
        type: Number
    },
    coreProjectLevel: {
        type: Number
    },
    problemSolving: [{
        levelName: {
            type: String,
        },
        attempts: {
            type: Number,
        },
        date: {
            type: Date,
        }
    }]
});

const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;
