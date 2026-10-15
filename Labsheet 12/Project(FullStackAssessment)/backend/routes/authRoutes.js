const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users, loginAttempts } = require("../store");

const router = express.Router();

const WINDOW_MS = 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

function validEmail(email) {
    return typeof email === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/register", async (req, res) => {
    try {
        const { email, password, role = "user" } = req.body || {};

        if (
            !validEmail(email) ||
            typeof password !== "string" ||
            password.length < 1 ||
            !["user", "admin"].includes(role)
        ) {
            return res.status(400).json({
                message: "Valid email, password and role are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (users.some(user => user.email === normalizedEmail)) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        users.push({
            id: require("crypto").randomUUID(),
            email: normalizedEmail,
            password: hashedPassword,
            role
        });

        return res.status(201).json({
            message: "User registered successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!validEmail(email) || typeof password !== "string") {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const now = Date.now();

        const attempts = (loginAttempts.get(normalizedEmail) || [])
            .filter(timestamp => now - timestamp < WINDOW_MS);

        loginAttempts.set(normalizedEmail, attempts);

        if (attempts.length >= MAX_FAILED_ATTEMPTS) {
            const retryAfter = Math.max(
                1,
                Math.ceil((attempts[0] + WINDOW_MS - now) / 1000)
            );

            res.set("Retry-After", String(retryAfter));

            return res.status(429).json({
                message: "Too many failed login attempts. Try again later."
            });
        }

        const user = users.find(
            item => item.email === normalizedEmail
        );

        const passwordMatches = user
            ? await bcrypt.compare(password, user.password)
            : false;

        if (!passwordMatches) {
            attempts.push(now);
            loginAttempts.set(normalizedEmail, attempts);

            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                sub: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // Successful login clears the failed-attempt history.
        // loginAttempts.delete(normalizedEmail);

        return res.status(200).json({ token });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;