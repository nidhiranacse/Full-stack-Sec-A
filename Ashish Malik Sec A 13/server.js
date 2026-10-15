
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const secretKey = 'mySecretKey123';

const users = [];

app.use(express.json());

// 1. REGISTER API
app.post('/register', (req, res) => {
    const { username, password } = req.body || {};

    if (
        typeof username !== 'string' ||
        !username.trim() ||
        typeof password !== 'string' ||
        password.length < 6
    ) {
        return res.status(400).json({
            error: 'Invalid input'
        });
    }

    const existingUser = users.find(
        user => user.username === username
    );

    if (existingUser) {
        return res.status(409).json({
            error: 'Username already exists'
        });
    }

    users.push({ username, password });

    return res.status(201).json({
        message: 'User registered'
    });
});

// 2. LOGIN API
app.post('/login', (req, res) => {
    const { username, password } = req.body || {};

    const user = users.find(
        user =>
            user.username === username &&
            user.password === password
    );

    if (!user) {
        return res.status(401).json({
            error: 'Invalid credentials'
        });
    }

    const token = jwt.sign(
        { username: user.username },
        secretKey,
        { expiresIn: '1h' }
    );

    return res.status(200).json({ token });
});

// 3. PROTECTED PROFILE API
app.get('/profile', (req, res) => {
    const auth = req.headers.authorization;

    if (
        !auth ||
        !auth.startsWith('Bearer ') ||
        !auth.slice(7).trim()
    ) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }

    try {
        const token = auth.slice(7).trim();
        const decoded = jwt.verify(token, secretKey);

        if (
            typeof decoded === 'string' ||
            typeof decoded.username !== 'string'
        ) {
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }

        return res.status(200).json({
            username: decoded.username
        });
    } catch (error) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
