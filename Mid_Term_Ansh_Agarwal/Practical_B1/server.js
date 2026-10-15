const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const SECRET_KEY = 'my_secret_key';
const users = [];

app.post('/register', (req, res) => {
const { username, password } = req.body;


if (!username || !username.trim() || !password || password.length < 6) {
    return res.status(400).json({ error: 'Invalid input' });
}

const existingUser = users.find(user => user.username === username);

if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' });
}

users.push({ username, password });

res.status(201).json({ message: 'User registered' });

});

app.post('/login', (req, res) => {
const { username, password } = req.body;

const user = users.find(
    user => user.username === username && user.password === password
);

if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
}

const token = jwt.sign(
    { username: user.username },
    SECRET_KEY,
    { expiresIn: '1h' }
);

res.status(200).json({ token });

});

app.get('/profile', (req, res) => {
const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
}

const token = authHeader.split(' ')[1];

if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
}

try {
    const decoded = jwt.verify(token, SECRET_KEY);

    res.status(200).json({ username: decoded.username });
} catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
}

});

app.listen(3000, () => {
console.log('Server running on port 3000');
});
