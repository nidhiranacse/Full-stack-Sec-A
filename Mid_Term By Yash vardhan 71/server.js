const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const users = [];
const secretKey = 'mySecretKey123';

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>JWT Authentication</title>
        <style>
            body {
                font-family: Arial;
                background: #f0f2f5;
                padding: 30px;
            }
            .container {
                max-width: 350px;
                margin: auto;
                padding: 25px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 0 10px #ccc;
            }
            h2 { text-align: center; }
            input, button {
                width: 100%;
                box-sizing: border-box;
                padding: 10px;
                margin: 8px 0;
            }
            button {
                background: #2563eb;
                color: white;
                border: none;
                cursor: pointer;
            }
            #result {
                text-align: center;
                overflow-wrap: anywhere;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Register</h2>
            <form id="registerForm">
                <input id="regUser" placeholder="Username" required>
                <input id="regPass" type="password" placeholder="Password" required>
                <button type="submit">Register</button>
            </form>

            <h2>Login</h2>
            <form id="loginForm">
                <input id="loginUser" placeholder="Username" required>
                <input id="loginPass" type="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>

            <button id="profileBtn">View Profile</button>
            <button id="logoutBtn">Logout</button>
            <p id="result"></p>
        </div>

        <script>
            const result = document.getElementById('result');

            document.getElementById('registerForm').onsubmit = async function(e) {
                e.preventDefault();

                try {
                    const response = await fetch('/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: document.getElementById('regUser').value,
                            password: document.getElementById('regPass').value
                        })
                    });

                    const data = await response.json();
                    result.textContent = data.message || data.error;
                } catch {
                    result.textContent = 'Request failed';
                }
            };

            document.getElementById('loginForm').onsubmit = async function(e) {
                e.preventDefault();

                try {
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: document.getElementById('loginUser').value,
                            password: document.getElementById('loginPass').value
                        })
                    });

                    const data = await response.json();

                    if (data.token) {
                        sessionStorage.setItem('token', data.token);
                        result.textContent = 'Login successful';
                    } else {
                        result.textContent = data.error;
                    }
                } catch {
                    result.textContent = 'Request failed';
                }
            };

            document.getElementById('profileBtn').onclick = async function() {
                try {
                    const response = await fetch('/profile', {
                        headers: {
                            Authorization: 'Bearer ' + (sessionStorage.getItem('token') || '')
                        }
                    });

                    const data = await response.json();
                    result.textContent = data.username
                        ? 'Welcome, ' + data.username
                        : data.error;
                } catch {
                    result.textContent = 'Request failed';
                }
            };

            document.getElementById('logoutBtn').onclick = function() {
                sessionStorage.removeItem('token');
                result.textContent = 'Logged out successfully';
            };
        </script>
    </body>
    </html>
    `);
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (typeof username !== 'string' || !username.trim() ||
        typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    if (users.some(user => user.username === username)) {
        return res.status(409).json({ error: 'Username already exists' });
    }

    users.push({ username, password });

    res.status(201).json({ message: 'User registered' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body || {};

    const user = users.find(
        user => user.username === username && user.password === password
    );

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { username: user.username },
        secretKey,
        { expiresIn: '1h' }
    );

    res.status(200).json({ token });
});

app.get('/profile', (req, res) => {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith('Bearer ') || !auth.slice(7).trim()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(auth.slice(7), secretKey);
        res.status(200).json({ username: decoded.username });
    } catch {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});