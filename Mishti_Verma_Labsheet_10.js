const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 5000;

const JWT_SECRET = "CampusConnect_Lab10_Secret_Key";
const REFRESH_SECRET = "CampusConnect_Refresh_Secret";

const MONGO_URL =
    process.env.MONGO_URL ||
    "mongodb://127.0.0.1:27017/campusconnect";

const REDIS_URL =
    process.env.REDIS_URL ||
    "redis://127.0.0.1:6379";

let redisClient = null;

/* =========================
   MIDDLEWARE
========================= */

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5000",
        credentials: true
    })
);

/* =========================
   REDIS
========================= */

async function connectRedis() {
    try {
        const client = createClient({
            url: REDIS_URL,
            socket: {
                connectTimeout: 1000,
                reconnectStrategy: () => false
            }
        });

        client.on("error", () => {});

        await client.connect();

        redisClient = client;
        console.log("Redis Connected");
    } catch (error) {
        redisClient = null;
        console.log("Redis not available. Running without Redis cache.");
    }
}

/* =========================
   MONGODB
========================= */

async function connectMongo() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("MongoDB Connected");
        await createDemoUsers();
    } catch (error) {
        console.log("MongoDB Error:", error.message);
    }
}

/* =========================
   USER SCHEMA
========================= */

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["ADMIN", "STUDENT"],
            default: "STUDENT"
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

/* =========================
   EVENT SCHEMA
========================= */

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        date: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        attendees: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
);

const Event = mongoose.model("Event", eventSchema);

/* =========================
   ANNOUNCEMENT SCHEMA
========================= */

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

const Announcement = mongoose.model(
    "Announcement",
    announcementSchema
);

/* =========================
   VALIDATION
========================= */

const registerValidation = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["ADMIN", "STUDENT"]).optional()
});

const loginValidation = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

const eventValidation = z.object({
    title: z.string().min(2),
    description: z.string().min(2),
    date: z.string().min(1),
    location: z.string().min(2)
});

const announcementValidation = z.object({
    title: z.string().min(2),
    message: z.string().min(2)
});

/* =========================
   DEMO USERS
========================= */

async function createDemoUsers() {
    try {
        const adminExists = await User.findOne({
            email: "admin@campus.com"
        });

        if (!adminExists) {
            await User.create({
                name: "Campus Admin",
                email: "admin@campus.com",
                passwordHash: await bcrypt.hash("admin123", 10),
                role: "ADMIN"
            });
        }

        const studentExists = await User.findOne({
            email: "student@campus.com"
        });

        if (!studentExists) {
            await User.create({
                name: "Campus Student",
                email: "student@campus.com",
                passwordHash: await bcrypt.hash("student123", 10),
                role: "STUDENT"
            });
        }

        console.log("Demo users ready");
    } catch (error) {
        console.log("Demo user error:", error.message);
    }
}

/* =========================
   JWT
========================= */

function createAccessToken(user) {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );
}

function createRefreshToken(user) {
    return jwt.sign(
        {
            id: user._id
        },
        REFRESH_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

/* =========================
   AUTHENTICATION
========================= */

function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

/* =========================
   RBAC
========================= */

function authorize(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({
                message:
                    "Access denied. Admin privileges required."
            });
        }

        next();
    };
}

/* =========================
   RATE LIMIT
========================= */

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message:
            "Too many login attempts. Try again later."
    }
});

/* =========================
   REGISTER
========================= */

app.post(
    "/api/auth/register",
    async (req, res) => {
        try {
            const data =
                registerValidation.parse(req.body);

            const existing =
                await User.findOne({
                    email: data.email
                });

            if (existing) {
                return res.status(400).json({
                    message:
                        "Email already registered"
                });
            }

            const passwordHash =
                await bcrypt.hash(
                    data.password,
                    10
                );

            const user =
                await User.create({
                    name: data.name,
                    email: data.email,
                    passwordHash,
                    role:
                        data.role || "STUDENT"
                });

            res.status(201).json({
                message:
                    "Registration successful",

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(400).json({
                message:
                    "Invalid registration data",
                error:
                    error.errors ||
                    error.message
            });
        }
    }
);

/* =========================
   LOGIN
========================= */

app.post(
    "/api/auth/login",
    loginLimiter,
    async (req, res) => {
        try {
            const data =
                loginValidation.parse(req.body);

            const user =
                await User.findOne({
                    email: data.email
                });

            if (!user) {
                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });
            }

            const valid =
                await bcrypt.compare(
                    data.password,
                    user.passwordHash
                );

            if (!valid) {
                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });
            }

            const accessToken =
                createAccessToken(user);

            const refreshToken =
                createRefreshToken(user);

            res.cookie(
                "refreshToken",
                refreshToken,
                {
                    httpOnly: true,
                    sameSite: "strict",
                    maxAge:
                        7 *
                        24 *
                        60 *
                        60 *
                        1000
                }
            );

            res.json({
                message: "Login successful",

                accessToken,

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(400).json({
                message:
                    "Invalid login data"
            });
        }
    }
);

/* =========================
   REFRESH
========================= */

app.post(
    "/api/auth/refresh",
    async (req, res) => {
        const token =
            req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                message:
                    "Refresh token missing"
            });
        }

        try {
            const decoded =
                jwt.verify(
                    token,
                    REFRESH_SECRET
                );

            const user =
                await User.findById(
                    decoded.id
                );

            if (!user) {
                return res.status(401).json({
                    message:
                        "User not found"
                });
            }

            const accessToken =
                createAccessToken(user);

            res.json({
                accessToken
            });
        } catch (error) {
            res.status(401).json({
                message:
                    "Invalid refresh token"
            });
        }
    }
);

/* =========================
   LOGOUT
========================= */

app.post(
    "/api/auth/logout",
    (req, res) => {
        res.clearCookie("refreshToken");

        res.json({
            message:
                "Logged out successfully"
        });
    }
);

/* =========================
   REDIS CACHE
========================= */

async function clearEventCache() {
    if (
        redisClient &&
        redisClient.isOpen
    ) {
        try {
            await redisClient.del("events");
        } catch (error) {
            console.log(
                "Redis cache clear skipped"
            );
        }
    }
}

/* =========================
   GET EVENTS
========================= */

app.get(
    "/api/events",
    async (req, res) => {
        const start = Date.now();

        try {
            if (
                redisClient &&
                redisClient.isOpen
            ) {
                try {
                    const cached =
                        await redisClient.get(
                            "events"
                        );

                    if (cached) {
                        return res.json({
                            source:
                                "Redis Cache",

                            responseTime:
                                Date.now() -
                                start +
                                " ms",

                            events:
                                JSON.parse(cached)
                        });
                    }
                } catch (error) {}
            }

            const events =
                await Event.find()
                    .populate(
                        "createdBy",
                        "name email"
                    )
                    .sort({
                        createdAt: -1
                    });

            if (
                redisClient &&
                redisClient.isOpen
            ) {
                try {
                    await redisClient.setEx(
                        "events",
                        60,
                        JSON.stringify(events)
                    );
                } catch (error) {}
            }

            res.json({
                source: "MongoDB",

                responseTime:
                    Date.now() -
                    start +
                    " ms",

                events
            });
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);

/* =========================
   SINGLE EVENT
========================= */

app.get(
    "/api/events/:id",
    async (req, res) => {
        try {
            const event =
                await Event.findById(
                    req.params.id
                );

            if (!event) {
                return res.status(404).json({
                    message:
                        "Event not found"
                });
            }

            res.json(event);
        } catch (error) {
            res.status(400).json({
                message:
                    "Invalid event ID"
            });
        }
    }
);

/* =========================
   CREATE EVENT
========================= */

app.post(
    "/api/events",
    authenticate,
    authorize("ADMIN"),
    async (req, res) => {
        try {
            const data =
                eventValidation.parse(
                    req.body
                );

            const event =
                await Event.create({
                    title: data.title,
                    description:
                        data.description,
                    date: data.date,
                    location:
                        data.location,
                    createdBy:
                        req.user.id
                });

            await clearEventCache();

            res.status(201).json({
                message:
                    "Event created successfully",
                event
            });
        } catch (error) {
            res.status(400).json({
                message:
                    "Invalid event data",
                error:
                    error.errors ||
                    error.message
            });
        }
    }
);

/* =========================
   UPDATE EVENT
========================= */

app.put(
    "/api/events/:id",
    authenticate,
    authorize("ADMIN"),
    async (req, res) => {
        try {
            const data =
                eventValidation.parse(
                    req.body
                );

            const event =
                await Event.findByIdAndUpdate(
                    req.params.id,
                    data,
                    {
                        new: true
                    }
                );

            if (!event) {
                return res.status(404).json({
                    message:
                        "Event not found"
                });
            }

            await clearEventCache();

            res.json({
                message:
                    "Event updated successfully",
                event
            });
        } catch (error) {
            res.status(400).json({
                message:
                    "Invalid event data"
            });
        }
    }
);

/* =========================
   DELETE EVENT
========================= */

app.delete(
    "/api/events/:id",
    authenticate,
    authorize("ADMIN"),
    async (req, res) => {
        try {
            const event =
                await Event.findByIdAndDelete(
                    req.params.id
                );

            if (!event) {
                return res.status(404).json({
                    message:
                        "Event not found"
                });
            }

            await clearEventCache();

            res.json({
                message:
                    "Event deleted successfully"
            });
        } catch (error) {
            res.status(400).json({
                message:
                    "Invalid event ID"
            });
        }
    }
);

/* =========================
   RSVP
========================= */

app.post(
    "/api/events/:id/rsvp",
    authenticate,
    async (req, res) => {
        try {
            const event =
                await Event.findById(
                    req.params.id
                );

            if (!event) {
                return res.status(404).json({
                    message:
                        "Event not found"
                });
            }

            const alreadyJoined =
                event.attendees
                    .map(String)
                    .includes(
                        String(req.user.id)
                    );

            if (!alreadyJoined) {
                event.attendees.push(
                    req.user.id
                );

                await event.save();
                await clearEventCache();
            }

            res.json({
                message:
                    "RSVP successful"
            });
        } catch (error) {
            res.status(400).json({
                message:
                    "Unable to RSVP"
            });
        }
    }
);

/* =========================
   CREATE ANNOUNCEMENT
========================= */

app.post(
    "/api/announcements",
    authenticate,
    authorize("ADMIN"),
    async (req, res) => {
        try {
            const data =
                announcementValidation.parse(
                    req.body
                );

            const announcement =
                await Announcement.create({
                    title: data.title,
                    message:
                        data.message,
                    createdBy:
                        req.user.id
                });

            io.to("students").emit(
                "new-announcement",
                {
                    title:
                        announcement.title,

                    message:
                        announcement.message,

                    createdAt:
                        announcement.createdAt
                }
            );

            res.status(201).json({
                message:
                    "Announcement created",
                announcement
            });
        } catch (error) {
            res.status(400).json({
                message:
                    "Invalid announcement data"
            });
        }
    }
);

/* =========================
   GET ANNOUNCEMENTS
========================= */

app.get(
    "/api/announcements",
    authenticate,
    async (req, res) => {
        try {
            const announcements =
                await Announcement.find()
                    .sort({
                        createdAt: -1
                    });

            res.json(announcements);
        } catch (error) {
            res.status(500).json({
                message:
                    "Unable to load announcements"
            });
        }
    }
);

/* =========================
   SOCKET.IO AUTH
========================= */

io.use((socket, next) => {
    try {
        const token =
            socket.handshake.auth.token;

        if (!token) {
            return next(
                new Error(
                    "Authentication required"
                )
            );
        }

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        socket.user = decoded;

        next();
    } catch (error) {
        next(
            new Error(
                "Invalid socket token"
            )
        );
    }
});

/* =========================
   SOCKET.IO CONNECTION
========================= */

io.on(
    "connection",
    socket => {
        console.log(
            "Socket connected:",
            socket.user.email
        );

        if (
            socket.user.role ===
            "STUDENT"
        ) {
            socket.join("students");
        }

        socket.on(
            "disconnect",
            () => {
                console.log(
                    "Socket disconnected:",
                    socket.user.email
                );
            }
        );
    }
);

/* =====================================================
   FRONTEND
===================================================== */

app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>

<title>CampusConnect</title>

<meta
    name="viewport"
    content="width=device-width,initial-scale=1"
/>

<script src="https://unpkg.com/react@18/umd/react.development.js"></script>

<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

<script src="https://unpkg.com/react-redux@8.1.3/dist/react-redux.min.js"></script>

<script src="https://unpkg.com/@reduxjs/toolkit@1.9.7/dist/redux-toolkit.umd.js"></script>

<script src="/socket.io/socket.io.js"></script>

<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<style>

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #f1f5f9;
    color: #222;
}

header {
    background: #172554;
    color: white;
    padding: 18px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

header h1 {
    margin: 0;
}

.container {
    width: 92%;
    max-width: 1100px;
    margin: 25px auto;
}

.card {
    background: white;
    padding: 25px;
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: 0 3px 10px #ccc;
}

.center {
    text-align: center;
}

input,
textarea,
select {
    width: 100%;
    padding: 12px;
    margin: 7px 0 14px;
    border: 1px solid #ccc;
    border-radius: 6px;
}

button {
    padding: 10px 17px;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
    margin: 4px;
}

.primary {
    background: #172554;
    color: white;
}

.success {
    background: #16a34a;
    color: white;
}

.danger {
    background: #dc2626;
    color: white;
}

.secondary {
    background: #64748b;
    color: white;
}

.event {
    border: 1px solid #ddd;
    border-radius: 9px;
    padding: 18px;
    margin: 15px 0;
}

.badge {
    background: #dc2626;
    color: white;
    border-radius: 20px;
    padding: 5px 10px;
    margin: 0 10px;
}

.toast {
    position: fixed;
    right: 20px;
    top: 80px;
    background: #16a34a;
    color: white;
    padding: 16px 22px;
    border-radius: 8px;
    box-shadow: 0 3px 10px #888;
    z-index: 100;
}

.error {
    color: #dc2626;
    font-weight: bold;
}

.info {
    background: #e0f2fe;
    padding: 15px;
    border-radius: 8px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit,minmax(250px,1fr));
    gap: 20px;
}

</style>

</head>

<body>

<div id="root"></div>

<script type="text/babel">

const {
    useState,
    useEffect
} = React;

const {
    Provider,
    useDispatch,
    useSelector
} = ReactRedux;

const {
    configureStore,
    createSlice
} = RTK;

/* =========================
   AUTH SLICE
========================= */

const authSlice = createSlice({
    name: "auth",

    initialState: {
        user: null,
        token: null
    },

    reducers: {

        login: (state, action) => {
            state.user =
                action.payload.user;

            state.token =
                action.payload.accessToken;
        },

        logout: state => {
            state.user = null;
            state.token = null;
        }

    }
});

/* =========================
   EVENT SLICE
========================= */

const eventSlice = createSlice({
    name: "events",

    initialState: {
        events: []
    },

    reducers: {

        setEvents: (state, action) => {
            state.events =
                action.payload;
        }

    }
});

/* =========================
   STORE
========================= */

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        events: eventSlice.reducer
    }
});

/* =========================
   LOGIN
========================= */

function Login() {

    const dispatch = useDispatch();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    const login = async () => {

        try {

            const response =
                await fetch(
                    "/api/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                setMessage(
                    data.message
                );
                return;
            }

            dispatch(
                authSlice.actions.login(
                    data
                )
            );

        } catch (error) {

            setMessage(
                "Server error"
            );
        }
    };

    return (

        <div className="container">

            <div
                className="card center"
                style={{
                    maxWidth: "500px",
                    margin: "60px auto"
                }}
            >

                <h1>
                    CampusConnect
                </h1>

                <h2>
                    Login
                </h2>

                <input
                    placeholder="Email"
                    value={email}
                    onChange={
                        e =>
                            setEmail(
                                e.target.value
                            )
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={
                        e =>
                            setPassword(
                                e.target.value
                            )
                    }
                />

                <button
                    className="primary"
                    onClick={login}
                >
                    Login
                </button>

                {
                    message &&
                    <p className="error">
                        {message}
                    </p>
                }

                <hr />

                <div className="info">

                    <strong>
                        Demo Admin
                    </strong>

                    <br />

                    admin@campus.com

                    <br />

                    admin123

                    <br /><br />

                    <strong>
                        Demo Student
                    </strong>

                    <br />

                    student@campus.com

                    <br />

                    student123

                </div>

            </div>

        </div>
    );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard() {

    const dispatch = useDispatch();

    const user =
        useSelector(
            state =>
                state.auth.user
        );

    const token =
        useSelector(
            state =>
                state.auth.token
        );

    const events =
        useSelector(
            state =>
                state.events.events
        );

    const [search, setSearch] =
        useState("");

    const [announcement, setAnnouncement] =
        useState(null);

    const [notificationCount, setNotificationCount] =
        useState(0);

    const [message, setMessage] =
        useState("");

    /* =========================
       LOAD EVENTS
    ========================= */

    const loadEvents = async () => {

        try {

            const response =
                await fetch(
                    "/api/events"
                );

            const data =
                await response.json();

            dispatch(
                eventSlice.actions.setEvents(
                    data.events || []
                )
            );

        } catch (error) {

            setMessage(
                "Unable to load events"
            );
        }
    };

    useEffect(() => {

        loadEvents();

    }, []);

    /* =========================
       SOCKET
    ========================= */

    useEffect(() => {

        if (!token) {
            return;
        }

        const socket =
            io({
                auth: {
                    token: token
                }
            });

        socket.on(
            "new-announcement",
            data => {

                setAnnouncement(
                    data
                );

                setNotificationCount(
                    count =>
                        count + 1
                );

                setTimeout(() => {
                    setAnnouncement(null);
                }, 5000);
            }
        );

        return () => {
            socket.disconnect();
        };

    }, [token]);

    /* =========================
       CREATE EVENT
    ========================= */

    const createEvent = async () => {

        const title =
            prompt(
                "Enter event title:"
            );

        if (!title) return;

        const description =
            prompt(
                "Enter description:"
            );

        if (!description) return;

        const date =
            prompt(
                "Enter date:"
            );

        if (!date) return;

        const location =
            prompt(
                "Enter location:"
            );

        if (!location) return;

        const response =
            await fetch(
                "/api/events",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({
                        title,
                        description,
                        date,
                        location
                    })
                }
            );

        const data =
            await response.json();

        alert(data.message);

        loadEvents();
    };

    /* =========================
       EDIT EVENT
    ========================= */

    const editEvent = async event => {

        const title =
            prompt(
                "Event title:",
                event.title
            );

        if (!title) return;

        const description =
            prompt(
                "Description:",
                event.description
            );

        if (!description) return;

        const date =
            prompt(
                "Date:",
                event.date
            );

        if (!date) return;

        const location =
            prompt(
                "Location:",
                event.location
            );

        if (!location) return;

        const response =
            await fetch(
                "/api/events/" +
                event._id,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({
                        title,
                        description,
                        date,
                        location
                    })
                }
            );

        const data =
            await response.json();

        alert(data.message);

        loadEvents();
    };

    /* =========================
       DELETE EVENT
    ========================= */

    const deleteEvent = async id => {

        if (
            !confirm(
                "Delete this event?"
            )
        ) {
            return;
        }

        const response =
            await fetch(
                "/api/events/" + id,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        alert(data.message);

        loadEvents();
    };

    /* =========================
       RSVP
    ========================= */

    const rsvp = async id => {

        const response =
            await fetch(
                "/api/events/" +
                id +
                "/rsvp",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        alert(data.message);

        loadEvents();
    };

    /* =========================
       ANNOUNCEMENT
    ========================= */

    const createAnnouncement =
        async () => {

            const title =
                prompt(
                    "Announcement title:"
                );

            if (!title) return;

            const msg =
                prompt(
                    "Announcement message:"
                );

            if (!msg) return;

            const response =
                await fetch(
                    "/api/announcements",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token
                        },

                        body: JSON.stringify({
                            title,
                            message: msg
                        })
                    }
                );

            const data =
                await response.json();

            alert(data.message);
        };

    /* =========================
       LOGOUT
    ========================= */

    const logout = async () => {

        await fetch(
            "/api/auth/logout",
            {
                method: "POST",
                credentials: "include"
            }
        );

        dispatch(
            authSlice.actions.logout()
        );
    };

    /* =========================
       SEARCH
    ========================= */

    const filtered =
        events.filter(
            event =>
                event.title
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )
        );

    return (

        <div>

            <header>

                <h1>
                    CampusConnect
                </h1>

                <div>

                    <span>
                        {user.name}
                        {" "}
                        ({user.role})
                    </span>

                    <span className="badge">
                        {notificationCount}
                    </span>

                    <button
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {
                announcement &&
                <div className="toast">

                    <strong>
                        New Announcement
                    </strong>

                    <br />

                    {announcement.title}

                    <br />

                    {announcement.message}

                </div>
            }

            <div className="container">

                <div className="card">

                    <h2>
                        Dashboard
                    </h2>

                    <p>
                        Welcome,
                        {" "}
                        <strong>
                            {user.name}
                        </strong>
                    </p>

                    <p>
                        Role:
                        {" "}
                        <strong>
                            {user.role}
                        </strong>
                    </p>

                    {
                        user.role === "ADMIN" &&
                        <div>

                            <button
                                className="primary"
                                onClick={
                                    createEvent
                                }
                            >
                                Create Event
                            </button>

                            <button
                                className="success"
                                onClick={
                                    createAnnouncement
                                }
                            >
                                New Announcement
                            </button>

                        </div>
                    }

                </div>

                <div className="card">

                    <h2>
                        Events
                    </h2>

                    <input
                        placeholder=
                            "Search events by title..."
                        value={search}
                        onChange={
                            e =>
                                setSearch(
                                    e.target.value
                                )
                        }
                    />

                    {
                        filtered.length === 0 &&
                        <p>
                            No events found.
                        </p>
                    }

                    {
                        filtered.map(
                            event => (

                                <div
                                    className="event"
                                    key={event._id}
                                >

                                    <h3>
                                        {event.title}
                                    </h3>

                                    <p>
                                        {event.description}
                                    </p>

                                    <p>
                                        <strong>
                                            Date:
                                        </strong>
                                        {" "}
                                        {event.date}
                                    </p>

                                    <p>
                                        <strong>
                                            Location:
                                        </strong>
                                        {" "}
                                        {event.location}
                                    </p>

                                    <p>
                                        <strong>
                                            RSVP Count:
                                        </strong>
                                        {" "}
                                        {
                                            event.attendees
                                                ?
                                            event.attendees.length
                                                :
                                            0
                                        }
                                    </p>

                                    {
                                        user.role ===
                                        "STUDENT" &&
                                        <button
                                            className="success"
                                            onClick={
                                                () =>
                                                    rsvp(
                                                        event._id
                                                    )
                                            }
                                        >
                                            RSVP
                                        </button>
                                    }

                                    {
                                        user.role ===
                                        "ADMIN" &&
                                        <div>

                                            <button
                                                className="primary"
                                                onClick={
                                                    () =>
                                                        editEvent(
                                                            event
                                                        )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="danger"
                                                onClick={
                                                    () =>
                                                        deleteEvent(
                                                            event._id
                                                        )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    }

                                </div>

                            )
                        )
                    }

                </div>

                {
                    message &&
                    <div className="card">
                        <p className="error">
                            {message}
                        </p>
                    </div>
                }

            </div>

        </div>
    );
}

/* =========================
   APP
========================= */

function App() {

    const user =
        useSelector(
            state =>
                state.auth.user
        );

    if (!user) {
        return <Login />;
    }

    return <Dashboard />;
}

/* =========================
   RENDER
========================= */

const root =
    ReactDOM.createRoot(
        document.getElementById(
            "root"
        )
    );

root.render(
    <Provider store={store}>
        <App />
    </Provider>
);

</script>

</body>
</html>
    `);
});

/* =========================
   DOCKER FILES
========================= */

function createDeploymentFiles() {

    const backendDocker = `
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node","Mishti_Verma_Labsheet_10.js"]
`;

    const compose = `
services:

  backend:

    build:
      context: .
      dockerfile: Dockerfile.backend

    ports:
      - "5000:5000"

    environment:
      MONGO_URL: mongodb://mongodb:27017/campusconnect
      REDIS_URL: redis://redis:6379

    depends_on:
      - mongodb
      - redis

  mongodb:

    image: mongo:7

    restart: always

    ports:
      - "27017:27017"

    volumes:
      - mongo_data:/data/db

  redis:

    image: redis:7

    restart: always

    ports:
      - "6379:6379"

volumes:

  mongo_data:
`;

    try {

        fs.writeFileSync(
            "Dockerfile.backend",
            backendDocker
        );

        fs.writeFileSync(
            "docker-compose.yml",
            compose
        );

        console.log(
            "Deployment files generated."
        );

    } catch (error) {

        console.log(
            "Could not create deployment files:",
            error.message
        );
    }
}

/* =========================
   START SERVER
========================= */

async function start() {

    createDeploymentFiles();

    server.listen(
        PORT,
        () => {
            console.log(
                "CampusConnect running at http://localhost:" +
                PORT
            );
        }
    );

    connectRedis();

    connectMongo();
}

start();