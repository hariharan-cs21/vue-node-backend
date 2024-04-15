const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
var cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { ObjectId } = require('mongoose').Types;

const uploadRoutes = require('./routes/uploadRoutes');
const Data = require('./models/dataModel');
const User = require('./models/users');
const Performance = require('./models/Performance');
const performanceRoutes = require('./routes/performanceRoutes');
var cookieParser = require('cookie-parser');

const app = express();
dotenv.config();
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:80',
    'https://localhost:443',

];
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 8 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,

    }
}));
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE']
}));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err)
});
app.get('/checkSession', async (req, res) => {
    try {
        if (req.session.loggedIn && req.session.user) {
            res.status(200).json({ loggedIn: true, user_type: req.session.user.userType });
        }
        else {
            res.status(200).json({ loggedIn: false });
        }

    }
    catch (error) {
        console.error("Error in checking session: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { user_email, password, userType } = req.body;
        const existingUser = await User.findOne({ user_email });
        console.log(req.body)
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            user_email,
            password: hashedPassword,
            userType,
        });
        await newUser.save();
        res.status(201).json({ user: newUser });
    } catch (error) {
        console.log("Error in user registration: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

app.get('/studentData', async (req, res) => {
    try {
        if (!req.session.loggedIn) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (req.session.user.userType === 'student') {
            return res.status(401).json({ message: 'Not allowed to access' });
        }
        const data = await Data.find();
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred while fetching data.');
    }
});


app.get('/performance/:id', async (req, res) => {
    const studentId = req.params.id;
    try {
        if (!req.session.loggedIn) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        const userData = await Data.findOne({ _id: studentId });
        if (!userData) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const performanceData = await Performance.findOne({ studentId });
        if (!performanceData) {
            return res.status(404).json({ message: 'Performance data not found' });
        }

        const combinedData = {
            ...userData.toObject(),
            assessmentsCompleted: performanceData.assessmentsCompleted
        };

        res.json(combinedData);

    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred while fetching data.');
    }
});
app.post('/performance', async (req, res) => {
    const { studentId } = req.body;
    try {
        if (!req.session.loggedIn) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        const userData = await Data.findOne({ _id: studentId });
        if (!userData) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const performanceData = await Performance.findOne({ studentId });
        if (!performanceData) {
            return res.status(404).json({ message: 'Performance data not found' });
        }

        const combinedData = {
            ...userData.toObject(),
            assessmentsCompleted: performanceData.assessmentsCompleted
        };

        res.json(combinedData);

    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred while fetching data.');
    }
});


app.post('/login', async (req, res) => {
    try {
        const { user_email, password } = req.body;

        let existingUser = await User.findOne({ user_email }).populate('studentId');

        if (!existingUser) {
            const userData = await Data.findOne({ studentEmail: user_email });

            if (userData && userData.contact === password) {
                const newStudent = new Data(userData);
                const savedStudent = await newStudent.save();

                const hashedPassword = await bcrypt.hash(password, 10);
                const newUser = new User({
                    user_email,
                    password: hashedPassword,
                    userType: 'student',
                    studentId: savedStudent._id,
                });
                existingUser = await newUser.save();

                existingUser = await User.findById(existingUser._id).populate('studentId');
            } else {
                return res.status(401).json({ message: 'Authentication failed', status: 0 });
            }
        } else {
            const passwordMatch = await bcrypt.compare(password, existingUser.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: 'Authentication failed', status: 0 });
            }
        }

        req.session.user = existingUser;
        req.session.loggedIn = true;
        res.status(200).json({ user: existingUser });
        req.session.save();

    } catch (error) {
        console.error("Error in user login: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/logout', function (req, res) {
    try {
        req.session.destroy();
        res.session = null;
        res.send('Logout Success');
    }
    catch (error) {
        console.error("Error in user logout: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
);

app.use('/upload', uploadRoutes)
app.use('/addPerformance', performanceRoutes)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

