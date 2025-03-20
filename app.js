import express from 'express';
import mongoose from 'mongoose';
import userModel from './models/userSchema.js';
import bcrypt from 'bcrypt';
import cors from 'cors';

const app = express();
const PORT = 5000;


const corsOptions = {
    origin: ['http://localhost:5173'], // Add your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allows sending cookies/auth headers
};
// Middleware to parse JSON
app.use(express.json());
app.use(cors(corsOptions));

// Database Connection
const DB_URI = 'mongodb+srv://anaintay4:anaintay4@cluster0.fpl6n.mongodb.net/';

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Default Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello, World!' });
});

// Signup API
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const existEmail = await userModel.findOne({ email });
        if (existEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({ name, email, password: encryptedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', newUser });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Login Api

// Login API (Fixed)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const existEmail = await userModel.findOne({ email });
        if (!existEmail) { // FIXED: Check if user does not exist
            return res.status(400).json({ message: 'Invalid email & password' });
        }

        const comparePassword = await bcrypt.compare(password, existEmail.password);
        if (!comparePassword) { // FIXED: Proper check for password mismatch
            return res.status(400).json({ message: 'Invalid email & password' });
        }

        res.status(200).json({ message: 'Login successfully' });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
// Get All Users API
app.get('/getUsers', async (req, res) => {
    try {
        const getData = await userModel.find();
        res.status(200).json({ message: 'Fetched all newUsers', getData });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});
