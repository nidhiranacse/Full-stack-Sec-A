const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const loginLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 5,
message: { message: "Too many login attempts. Try again later." }
});

const registerSchema = z.object({
name: z.string().trim().min(2),
email: z.string().trim().email(),
password: z.string().min(8)
});

const loginSchema = z.object({
email: z.string().email(),
password: z.string().min(1)
});

function createAccessToken(user) {
return jwt.sign(
{ id: user._id.toString(), role: user.role },
process.env.JWT_SECRET,
{ expiresIn: "15m" }
);
}

function createRefreshToken(user) {
return jwt.sign(
{ id: user._id.toString(), role: user.role },
process.env.JWT_REFRESH_SECRET,
{ expiresIn: "7d" }
);
}

function setRefreshCookie(res, token) {
res.cookie("refreshToken", token, {
httpOnly: true,
secure: process.env.NODE_ENV === "production",
sameSite: "strict",
maxAge: 7 * 24 * 60 * 60 * 1000
});
}

router.post("/register", async (req, res) => {
try {
const result = registerSchema.safeParse(req.body);


if (!result.success) {
  return res.status(400).json({ message: "Invalid registration details" });
}

const { name, email, password } = result.data;
const existingUser = await User.findOne({ email });

if (existingUser) {
  return res.status(409).json({ message: "Email already registered" });
}

const passwordHash = await bcrypt.hash(password, 12);
const user = await User.create({ name, email, passwordHash, role: "STUDENT" });
const accessToken = createAccessToken(user);

setRefreshCookie(res, createRefreshToken(user));

res.status(201).json({
  message: "Registration successful",
  accessToken,
  user: { id: user._id, name: user.name, email: user.email, role: user.role }
});

} catch (error) {
res.status(500).json({ message: "Registration failed" });
}
});

router.post("/login", loginLimiter, async (req, res) => {
try {
const result = loginSchema.safeParse(req.body);


if (!result.success) {
  return res.status(400).json({ message: "Invalid login details" });
}

const { email, password } = result.data;
const user = await User.findOne({ email });

if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
  return res.status(401).json({ message: "Invalid email or password" });
}

const accessToken = createAccessToken(user);
setRefreshCookie(res, createRefreshToken(user));

res.json({
  message: "Login successful",
  accessToken,
  user: { id: user._id, name: user.name, email: user.email, role: user.role }
});


} catch (error) {
res.status(500).json({ message: "Login failed" });
}
});

router.post("/refresh", async (req, res) => {
const token = req.cookies.refreshToken;

if (!token) {
return res.status(401).json({ message: "Refresh token required" });
}

try {
const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
const user = await User.findById(decoded.id);


if (!user) {
  return res.status(401).json({ message: "User not found" });
}

const accessToken = createAccessToken(user);
const refreshToken = createRefreshToken(user);

setRefreshCookie(res, refreshToken);

res.json({ accessToken });


} catch {
res.status(401).json({ message: "Invalid or expired refresh token" });
}
});

router.post("/logout", (req, res) => {
res.clearCookie("refreshToken", {
httpOnly: true,
secure: process.env.NODE_ENV === "production",
sameSite: "strict"
});
res.json({ message: "Logged out successfully" });
});

router.get("/me", authenticate, async (req, res) => {
try {
const user = await User.findById(req.user.id).select("-passwordHash");


if (!user) {
  return res.status(404).json({ message: "User not found" });
}

res.json({ user });


} catch {
res.status(500).json({ message: "Could not retrieve user" });
}
});

module.exports = router;
