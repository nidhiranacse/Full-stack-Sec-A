const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const studentRoutes = require('./routes/students');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/students', studentRoutes);


// MongoDB connection
mongoose
    .connect('mongodb://127.0.0.1:27017/studentDB')
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((error) => {
        console.error(
            'MongoDB connection error:',
            error
        );
    });


// Server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});