const express = require('express');
const router = express.Router();
const Performance = require('../models/Performance');
const { ObjectId } = require('mongoose').Types;
const Data = require('../models/dataModel');

router.post('/', async (req, res) => {
    try {

        if (!req.session.loggedIn || req.session.user.userType !== 'admin') {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { studentId, assessmentsCompleted } = req.body;


        if (!ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        if (!assessmentsCompleted || assessmentsCompleted.length === 0) {
            return res.status(400).json({ message: 'Assessment details are incomplete' });
        }

        const studentExists = await Data.findOne({ _id: studentId });

        if (!studentExists) {
            return res.status(404).json({ message: 'Student not found' });
        }

        let performance = await Performance.findOne({ studentId });

        if (performance) {
            performance.assessmentsCompleted.push(...assessmentsCompleted);
        } else {
            performance = new Performance({
                studentId,
                assessmentsCompleted
            });
        }

        await performance.save();

        res.status(201).json({ message: 'Performance data added successfully', performance });

    } catch (error) {
        console.error('Error adding performance data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




module.exports = router;
