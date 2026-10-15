const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 5000;

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "CampusConnectSecret_2026";

const DATA_FILE =
    path.join(
        __dirname,
        "campusconnect-data.json"
    );


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(
    express.json({
        limit: "2mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());


/* =========================================================
   DATABASE / JSON STORAGE
========================================================= */

const emptyStore = {
    users: [],
    events: [],
    resources: [],
    registrations: []
};


function loadStore() {

    try {

        if (!fs.existsSync(DATA_FILE)) {

            fs.writeFileSync(
                DATA_FILE,
                JSON.stringify(
                    emptyStore,
                    null,
                    2
                )
            );

            return {
                ...emptyStore
            };
        }


        const data =
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            );


        if (!data.trim()) {

            return {
                ...emptyStore
            };
        }


        const parsed =
            JSON.parse(data);


        return {
            users:
                Array.isArray(
                    parsed.users
                )
                    ? parsed.users
                    : [],

            events:
                Array.isArray(
                    parsed.events
                )
                    ? parsed.events
                    : [],

            resources:
                Array.isArray(
                    parsed.resources
                )
                    ? parsed.resources
                    : [],

            registrations:
                Array.isArray(
                    parsed.registrations
                )
                    ? parsed.registrations
                    : []
        };

    }
    catch (error) {

        console.error(
            "Could not read database:",
            error.message
        );

        return {
            ...emptyStore
        };
    }
}


let store =
    loadStore();


function saveStore() {

    try {

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(
                store,
                null,
                2
            )
        );

        return true;

    }
    catch (error) {

        console.error(
            "Could not save database:",
            error.message
        );

        return false;
    }
}


/* =========================================================
   HELPERS
========================================================= */

function id() {

    return crypto.randomUUID();

}


function cleanEmail(email) {

    return String(
        email || ""
    )
        .trim()
        .toLowerCase();

}


function userView(user) {

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    };
}


function createToken(user) {

    return jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

}


function sendAuthCookie(
    res,
    token
) {

    res.cookie(
        "cc_token",
        token,
        {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge:
                24 *
                60 *
                60 *
                1000
        }
    );

}


function removeAuthCookie(res) {

    res.clearCookie(
        "cc_token"
    );

}


function getToken(req) {

    const cookieToken =
        req.cookies.cc_token;

    if (cookieToken) {
        return cookieToken;
    }


    const auth =
        req.headers.authorization ||
        "";


    if (
        auth.startsWith(
            "Bearer "
        )
    ) {

        return auth.substring(7);

    }


    return null;
}


/* =========================================================
   AUTHENTICATION MIDDLEWARE
========================================================= */

function auth(req, res, next) {

    const token =
        getToken(req);


    if (!token) {

        return res.status(401).json({

            message:
                "Please login first."

        });

    }


    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        const user =
            store.users.find(
                item =>
                    item.id ===
                    decoded.id
            );


        if (!user) {

            return res.status(401).json({

                message:
                    "User account no longer exists."

            });

        }


        req.user = user;

        next();

    }
    catch (error) {

        return res.status(401).json({

            message:
                "Session expired. Please login again."

        });

    }

}


function role(requiredRole) {

    return function(
        req,
        res,
        next
    ) {

        if (
            req.user.role !==
            requiredRole
        ) {

            return res.status(403).json({

                message:
                    "You do not have permission for this action."

            });

        }


        next();

    };

}


/* =========================================================
   HOME PAGE
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.send(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"
>

<title>CampusConnect</title>

<style>

*{
    box-sizing:border-box;
}

body{
    margin:0;
    font-family:Arial,sans-serif;
    background:#eef5f4;
    color:#19324a;
}

.container{
    width:min(900px,94%);
    margin:45px auto;
}

.card{
    background:white;
    padding:30px;
    border-radius:16px;
    box-shadow:
        0 10px 30px
        rgba(0,0,0,.08);
}

h1{
    color:#123b45;
    margin-top:0;
}

.tabs{
    display:flex;
    gap:10px;
    margin:25px 0;
}

.tab{
    flex:1;
    padding:13px;
    border:0;
    border-radius:8px;
    background:#e5eeec;
    cursor:pointer;
    font-weight:bold;
}

.tab.active{
    background:#e16a42;
    color:white;
}

.form{
    display:none;
}

.form.active{
    display:block;
}

input,
select{
    width:100%;
    padding:12px;
    margin:8px 0;
    border:
        1px solid #b9cbc6;
    border-radius:8px;
    font-size:15px;
}

.submit{
    width:100%;
    padding:13px;
    margin-top:10px;
    border:0;
    border-radius:8px;
    background:#e16a42;
    color:white;
    font-size:15px;
    font-weight:bold;
    cursor:pointer;
}

.submit:hover{
    opacity:.9;
}

.message{
    min-height:25px;
    margin-top:15px;
}

.error{
    color:#b23b2c;
}

.success{
    color:#28735b;
}

.small{
    font-size:13px;
    color:#607871;
}

</style>

</head>


<body>


<div class="container">

<div class="card">

<h1>
CampusConnect
</h1>

<p>
Student Event & Resource Management Portal
</p>


<div class="tabs">

<button
id="loginTab"
class="tab active"
onclick="showLogin()"
>
Existing User
</button>


<button
id="registerTab"
class="tab"
onclick="showRegister()"
>
New User Registration
</button>

</div>


<!-- LOGIN -->

<form
id="loginForm"
class="form active"
>

<h2>
Existing User Login
</h2>


<input
id="loginEmail"
type="email"
placeholder="Email address"
required
>


<input
id="loginPassword"
type="password"
placeholder="Password"
required
>


<select
id="loginRole"
required
>

<option value="">
Select Role
</option>

<option value="STUDENT">
Student
</option>

<option value="ADMIN">
Admin
</option>

</select>


<button
class="submit"
type="submit"
>
Login
</button>

</form>


<!-- REGISTER -->

<form
id="registerForm"
class="form"
>

<h2>
Create New Account
</h2>


<input
id="registerName"
placeholder="Full name"
required
>


<input
id="registerEmail"
type="email"
placeholder="Email address"
required
>


<input
id="registerPassword"
type="password"
placeholder="Password - minimum 6 characters"
minlength="6"
required
>


<select
id="registerRole"
required
>

<option value="">
Select Role
</option>

<option value="STUDENT">
Student
</option>

<option value="ADMIN">
Admin
</option>

</select>


<button
class="submit"
type="submit"
>
Create Account
</button>


<p class="small">

Your account will be saved permanently in
campusconnect-data.json.

</p>

</form>


<div
id="message"
class="message"
></div>


</div>

</div>


<script>


function showLogin(){

    document
        .getElementById(
            "loginForm"
        )
        .classList.add("active");

    document
        .getElementById(
            "registerForm"
        )
        .classList.remove("active");

    document
        .getElementById(
            "loginTab"
        )
        .classList.add("active");

    document
        .getElementById(
            "registerTab"
        )
        .classList.remove("active");

    document
        .getElementById(
            "message"
        )
        .textContent = "";

}


function showRegister(){

    document
        .getElementById(
            "registerForm"
        )
        .classList.add("active");

    document
        .getElementById(
            "loginForm"
        )
        .classList.remove("active");

    document
        .getElementById(
            "registerTab"
        )
        .classList.add("active");

    document
        .getElementById(
            "loginTab"
        )
        .classList.remove("active");

    document
        .getElementById(
            "message"
        )
        .textContent = "";

}


/* LOGIN */

document
    .getElementById(
        "loginForm"
    )
    .addEventListener(
        "submit",
        async function(event){

            event.preventDefault();


            const message =
                document.getElementById(
                    "message"
                );


            message.className =
                "message";


            try{

                const response =
                    await fetch(
                        "/api/auth/login",
                        {
                            method:"POST",

                            headers:{
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:"include",

                            body:
                                JSON.stringify({

                                    email:
                                        document
                                        .getElementById(
                                            "loginEmail"
                                        )
                                        .value,

                                    password:
                                        document
                                        .getElementById(
                                            "loginPassword"
                                        )
                                        .value,

                                    role:
                                        document
                                        .getElementById(
                                            "loginRole"
                                        )
                                        .value

                                })
                        }
                    );


                const result =
                    await response.json();


                if(!response.ok){

                    throw new Error(
                        result.message
                    );

                }


                localStorage.setItem(
                    "campusconnectUser",
                    JSON.stringify(
                        result.user
                    )
                );


                window.location.href =
                    "/portal";

            }
            catch(error){

                message.className =
                    "message error";

                message.textContent =
                    error.message;

            }

        }
    );


/* REGISTER */

document
    .getElementById(
        "registerForm"
    )
    .addEventListener(
        "submit",
        async function(event){

            event.preventDefault();


            const message =
                document.getElementById(
                    "message"
                );


            message.className =
                "message";


            try{

                const response =
                    await fetch(
                        "/api/auth/register",
                        {
                            method:"POST",

                            headers:{
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:"include",

                            body:
                                JSON.stringify({

                                    name:
                                        document
                                        .getElementById(
                                            "registerName"
                                        )
                                        .value,

                                    email:
                                        document
                                        .getElementById(
                                            "registerEmail"
                                        )
                                        .value,

                                    password:
                                        document
                                        .getElementById(
                                            "registerPassword"
                                        )
                                        .value,

                                    role:
                                        document
                                        .getElementById(
                                            "registerRole"
                                        )
                                        .value

                                })
                        }
                    );


                const result =
                    await response.json();


                if(!response.ok){

                    throw new Error(
                        result.message
                    );

                }


                localStorage.setItem(
                    "campusconnectUser",
                    JSON.stringify(
                        result.user
                    )
                );


                message.className =
                    "message success";

                message.textContent =
                    "Account created successfully.";


                setTimeout(
                    function(){

                        window.location.href =
                            "/portal";

                    },
                    500
                );

            }
            catch(error){

                message.className =
                    "message error";

                message.textContent =
                    error.message;

            }

        }
    );


</script>

</body>

</html>

        `);

    }
);


/* =========================================================
   REGISTER
========================================================= */

app.post(
    "/api/auth/register",
    async (req, res) => {

        try {

            const name =
                String(
                    req.body.name ||
                    ""
                ).trim();

            const email =
                cleanEmail(
                    req.body.email
                );

            const password =
                String(
                    req.body.password ||
                    ""
                );

            const roleValue =
                String(
                    req.body.role ||
                    ""
                ).toUpperCase();


            if (
                !name ||
                !email ||
                !password ||
                !roleValue
            ) {

                return res.status(400).json({

                    message:
                        "Please fill all registration fields."

                });

            }


            if (
                password.length < 6
            ) {

                return res.status(400).json({

                    message:
                        "Password must contain at least 6 characters."

                });

            }


            if (
                roleValue !==
                    "STUDENT" &&
                roleValue !==
                    "ADMIN"
            ) {

                return res.status(400).json({

                    message:
                        "Please select Student or Admin."

                });

            }


            const existingUser =
                store.users.find(
                    user =>
                        user.email ===
                        email
                );


            if(existingUser){

                return res.status(409).json({

                    message:
                        "An account with this email already exists."

                });

            }


            const passwordHash =
                await bcrypt.hash(
                    password,
                    10
                );


            const user = {

                id:id(),

                name:name,

                email:email,

                passwordHash:
                    passwordHash,

                role:roleValue,

                createdAt:
                    new Date().toISOString()

            };


            store.users.push(
                user
            );


            if(!saveStore()){

                return res.status(500).json({

                    message:
                        "Could not save the new account."

                });

            }


            const token =
                createToken(user);


            sendAuthCookie(
                res,
                token
            );


            res.status(201).json({

                message:
                    "Account created successfully.",

                user:
                    userView(user)

            });

        }
        catch(error){

            console.error(error);

            res.status(500).json({

                message:
                    "Registration failed."

            });

        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

app.post(
    "/api/auth/login",
    async (req, res) => {

        try {

            const email =
                cleanEmail(
                    req.body.email
                );

            const password =
                String(
                    req.body.password ||
                    ""
                );

            const roleValue =
                String(
                    req.body.role ||
                    ""
                ).toUpperCase();


            if (
                !email ||
                !password ||
                !roleValue
            ) {

                return res.status(400).json({

                    message:
                        "Email, password and role are required."

                });

            }


            const user =
                store.users.find(
                    item =>
                        item.email ===
                        email
                );


            if(!user){

                return res.status(401).json({

                    message:
                        "No account exists with this email."

                });

            }


            if(
                user.role !==
                roleValue
            ){

                return res.status(401).json({

                    message:
                        "Selected role does not match this account."

                });

            }


            const passwordCorrect =
                await bcrypt.compare(
                    password,
                    user.passwordHash
                );


            if(!passwordCorrect){

                return res.status(401).json({

                    message:
                        "Incorrect password."

                });

            }


            const token =
                createToken(user);


            sendAuthCookie(
                res,
                token
            );


            res.json({

                message:
                    "Login successful.",

                user:
                    userView(user)

            });

        }
        catch(error){

            console.error(error);

            res.status(500).json({

                message:
                    "Login failed."

            });

        }

    }
);


/* =========================================================
   LOGOUT
========================================================= */

app.post(
    "/api/auth/logout",
    (req, res) => {

        removeAuthCookie(
            res
        );

        res.json({

            message:
                "Logged out successfully."

        });

    }
);


/* =========================================================
   CURRENT USER
========================================================= */

app.get(
    "/api/auth/me",
    auth,
    (req, res) => {

        res.json({

            user:
                userView(
                    req.user
                )

        });

    }
);


/* =========================================================
   EVENTS - VIEW
========================================================= */

app.get(
    "/api/events",
    auth,
    (req, res) => {

        const search =
            String(
                req.query.q ||
                ""
            )
            .trim()
            .toLowerCase();


        let events =
            [...store.events];


        if(search){

            events =
                events.filter(
                    event =>

                        String(
                            event.title
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            event.category
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            event.location
                        )
                        .toLowerCase()
                        .includes(search)
                );

        }


        events =
            events.map(
                event => {

                    const registrationCount =
                        store.registrations.filter(
                            item =>
                                item.eventId ===
                                event.id
                        ).length;


                    const registered =
                        store.registrations.some(
                            item =>

                                item.eventId ===
                                event.id

                                &&

                                item.userId ===
                                req.user.id
                        );


                    return {

                        ...event,

                        registrationCount:

                            registrationCount,

                        seatsLeft:
                            Math.max(
                                0,
                                event.capacity -
                                registrationCount
                            ),

                        registered:
                            registered

                    };

                }
            );


        res.json({

            data:events

        });

    }
);


/* =========================================================
   CREATE EVENT - ADMIN
========================================================= */

app.post(
    "/api/events",
    auth,
    role("ADMIN"),
    (req, res) => {

        const title =
            String(
                req.body.title ||
                ""
            ).trim();

        const description =
            String(
                req.body.description ||
                ""
            ).trim();

        const date =
            String(
                req.body.date ||
                ""
            ).trim();

        const eventLocation =
            String(
                req.body.location ||
                ""
            ).trim();

        const category =
            String(
                req.body.category ||
                ""
            ).trim();

        const capacity =
            Number(
                req.body.capacity
            );


        if(
            !title ||
            !description ||
            !date ||
            !eventLocation ||
            !category
        ){

            return res.status(400).json({

                message:
                    "Please fill all event fields."

            });

        }


        if(
            !Number.isInteger(
                capacity
            ) ||
            capacity < 1
        ){

            return res.status(400).json({

                message:
                    "Seat capacity must be at least 1."

            });

        }


        const event = {

            id:id(),

            title:title,

            description:
                description,

            date:date,

            location:
                eventLocation,

            category:
                category,

            capacity:
                capacity,

            createdBy:
                req.user.id,

            createdAt:
                new Date().toISOString()

        };


        store.events.push(
            event
        );


        saveStore();


        res.status(201).json({

            message:
                "Event created successfully.",

            event:event

        });

    }
);


/* =========================================================
   EDIT EVENT - ADMIN
========================================================= */

app.put(
    "/api/events/:eventId",
    auth,
    role("ADMIN"),
    (req, res) => {

        const event =
            store.events.find(
                item =>
                    item.id ===
                    req.params.eventId
            );


        if(!event){

            return res.status(404).json({

                message:
                    "Event not found."

            });

        }


        const title =
            String(
                req.body.title ||
                event.title
            ).trim();

        const description =
            String(
                req.body.description ||
                event.description
            ).trim();

        const date =
            String(
                req.body.date ||
                event.date
            ).trim();

        const eventLocation =
            String(
                req.body.location ||
                event.location
            ).trim();

        const category =
            String(
                req.body.category ||
                event.category
            ).trim();


        const capacity =
            req.body.capacity ===
            undefined

                ? event.capacity

                : Number(
                    req.body.capacity
                );


        if(
            !title ||
            !description ||
            !date ||
            !eventLocation ||
            !category
        ){

            return res.status(400).json({

                message:
                    "All event fields are required."

            });

        }


        const registrations =
            store.registrations.filter(
                item =>
                    item.eventId ===
                    event.id
            ).length;


        if(
            !Number.isInteger(
                capacity
            ) ||
            capacity < registrations
        ){

            return res.status(400).json({

                message:
                    "Capacity cannot be less than current registrations."

            });

        }


        event.title =
            title;

        event.description =
            description;

        event.date =
            date;

        event.location =
            eventLocation;

        event.category =
            category;

        event.capacity =
            capacity;


        saveStore();


        res.json({

            message:
                "Event updated successfully.",

            event:event

        });

    }
);


/* =========================================================
   DELETE EVENT - ADMIN
========================================================= */

app.delete(
    "/api/events/:eventId",
    auth,
    role("ADMIN"),
    (req, res) => {

        const index =
            store.events.findIndex(
                item =>
                    item.id ===
                    req.params.eventId
            );


        if(index === -1){

            return res.status(404).json({

                message:
                    "Event not found."

            });

        }


        store.events.splice(
            index,
            1
        );


        store.registrations =
            store.registrations.filter(
                item =>
                    item.eventId !==
                    req.params.eventId
            );


        saveStore();


        res.json({

            message:
                "Event deleted successfully."

        });

    }
);


/* =========================================================
   REGISTER FOR EVENT - STUDENT
========================================================= */

app.post(
    "/api/events/:eventId/register",
    auth,
    role("STUDENT"),
    (req, res) => {

        const event =
            store.events.find(
                item =>
                    item.id ===
                    req.params.eventId
            );


        if(!event){

            return res.status(404).json({

                message:
                    "Event not found."

            });

        }


        const alreadyRegistered =
            store.registrations.some(
                item =>

                    item.eventId ===
                    event.id

                    &&

                    item.userId ===
                    req.user.id
            );


        if(alreadyRegistered){

            return res.status(409).json({

                message:
                    "You are already registered for this event."

            });

        }


        const count =
            store.registrations.filter(
                item =>
                    item.eventId ===
                    event.id
            ).length;


        if(
            count >=
            event.capacity
        ){

            return res.status(400).json({

                message:
                    "This event is full."

            });

        }


        const registration = {

            id:id(),

            eventId:
                event.id,

            userId:
                req.user.id,

            registeredAt:
                new Date().toISOString()

        };


        store.registrations.push(
            registration
        );


        saveStore();


        res.status(201).json({

            message:
                "Successfully registered for the event.",

            registration:
                registration

        });

    }
);


/* =========================================================
   UNREGISTER - STUDENT
========================================================= */

app.delete(
    "/api/events/:eventId/register",
    auth,
    role("STUDENT"),
    (req, res) => {

        const index =
            store.registrations.findIndex(
                item =>

                    item.eventId ===
                    req.params.eventId

                    &&

                    item.userId ===
                    req.user.id
            );


        if(index === -1){

            return res.status(404).json({

                message:
                    "You are not registered for this event."

            });

        }


        store.registrations.splice(
            index,
            1
        );


        saveStore();


        res.json({

            message:
                "Registration cancelled successfully."

        });

    }
);


/* =========================================================
   RESOURCES - VIEW
========================================================= */

app.get(
    "/api/resources",
    auth,
    (req, res) => {

        const search =
            String(
                req.query.q ||
                ""
            )
            .trim()
            .toLowerCase();


        let resources =
            [...store.resources];


        if(search){

            resources =
                resources.filter(
                    resource =>

                        String(
                            resource.title
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            resource.subject
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            resource.semester
                        )
                        .toLowerCase()
                        .includes(search)
                );

        }


        res.json({

            data:resources

        });

    }
);


/* =========================================================
   ADD RESOURCE - ADMIN
========================================================= */

app.post(
    "/api/resources",
    auth,
    role("ADMIN"),
    (req, res) => {

        const title =
            String(
                req.body.title ||
                ""
            ).trim();

        const subject =
            String(
                req.body.subject ||
                ""
            ).trim();

        const semester =
            String(
                req.body.semester ||
                ""
            ).trim();

        const fileName =
            String(
                req.body.fileName ||
                ""
            ).trim();

        const fileUrl =
            String(
                req.body.fileUrl ||
                ""
            ).trim();


        if(
            !title ||
            !subject ||
            !semester ||
            !fileName
        ){

            return res.status(400).json({

                message:
                    "Title, subject, semester and file name are required."

            });

        }


        const resource = {

            id:id(),

            title:title,

            subject:subject,

            semester:semester,

            fileName:fileName,

            fileUrl:
                fileUrl || "#",

            createdBy:
                req.user.id,

            createdAt:
                new Date().toISOString()

        };


        store.resources.push(
            resource
        );


        saveStore();


        res.status(201).json({

            message:
                "Resource added successfully.",

            resource:
                resource

        });

    }
);


/* =========================================================
   DELETE RESOURCE - ADMIN
========================================================= */

app.delete(
    "/api/resources/:resourceId",
    auth,
    role("ADMIN"),
    (req, res) => {

        const index =
            store.resources.findIndex(
                item =>
                    item.id ===
                    req.params.resourceId
            );


        if(index === -1){

            return res.status(404).json({

                message:
                    "Resource not found."

            });

        }


        store.resources.splice(
            index,
            1
        );


        saveStore();


        res.json({

            message:
                "Resource deleted successfully."

        });

    }
);


/* =========================================================
   STUDENT DASHBOARD
========================================================= */

app.get(
    "/api/dashboard/student",
    auth,
    role("STUDENT"),
    (req, res) => {

        const registrations =
            store.registrations.filter(
                item =>
                    item.userId ===
                    req.user.id
            );


        const events =
            registrations
                .map(
                    registration =>
                        store.events.find(
                            event =>
                                event.id ===
                                registration.eventId
                        )
                )
                .filter(Boolean)
                .map(
                    event => {

                        const count =
                            store.registrations.filter(
                                item =>
                                    item.eventId ===
                                    event.id
                            ).length;


                        return {

                            ...event,

                            seatsLeft:
                                Math.max(
                                    0,
                                    event.capacity -
                                    count
                                )

                        };

                    }
                );


        res.json({

            user:
                userView(
                    req.user
                ),

            registrations:
                registrations,

            events:
                events,

            resources:
                store.resources

        });

    }
);


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

app.get(
    "/api/dashboard/admin",
    auth,
    role("ADMIN"),
    (req, res) => {

        res.json({

            totalEvents:
                store.events.length,

            totalRegistrations:
                store.registrations.length,

            totalResources:
                store.resources.length,

            totalStudents:
                store.users.filter(
                    user =>
                        user.role ===
                        "STUDENT"
                ).length,

            totalAdmins:
                store.users.filter(
                    user =>
                        user.role ===
                        "ADMIN"
                ).length

        });

    }
);


/* =========================================================
   PORTAL PAGE
========================================================= */

app.get(
    "/portal",
    auth,
    (req, res) => {

        res.send(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1.0"
>

<title>CampusConnect Portal</title>

<style>

*{
    box-sizing:border-box;
}

body{
    margin:0;
    font-family:Arial,sans-serif;
    background:#f3f7f6;
    color:#19324a;
}

header{
    background:#123b45;
    color:white;
    padding:20px 5%;
    display:flex;
    justify-content:space-between;
    align-items:center;
}

header h1{
    margin:0 0 5px;
}

main{
    width:min(1150px,94%);
    margin:25px auto;
}

.nav{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    margin-bottom:20px;
}

button{
    border:0;
    border-radius:7px;
    padding:10px 15px;
    background:#e16a42;
    color:white;
    cursor:pointer;
}

button:hover{
    opacity:.9;
}

button.green{
    background:#28735b;
}

button.red{
    background:#b23b2c;
}

button.gray{
    background:#607871;
}

button:disabled{
    opacity:.5;
    cursor:not-allowed;
}

input,
select,
textarea{
    padding:11px;
    border:1px solid #b9cbc6;
    border-radius:7px;
    font-size:14px;
}

input,
select{
    width:100%;
}

textarea{
    width:100%;
    min-height:80px;
    resize:vertical;
}

.card,
.event,
.resource,
.metric{
    background:white;
    padding:18px;
    margin:12px 0;
    border-radius:12px;
    box-shadow:
        0 5px 18px
        rgba(25,50,74,.08);
}

.event{
    display:flex;
    justify-content:space-between;
    gap:20px;
}

.eventActions{
    min-width:150px;
}

.formGrid{
    display:grid;
    grid-template-columns:
        1fr 1fr;
    gap:10px;
}

.full{
    grid-column:
        1 / -1;
}

.metrics{
    display:flex;
    gap:12px;
    flex-wrap:wrap;
}

.metric{
    flex:1;
    min-width:170px;
}

.metric strong{
    display:block;
    font-size:30px;
    color:#e16a42;
    margin-bottom:5px;
}

.hidden{
    display:none !important;
}

.error{
    color:#b23b2c;
}

.success{
    color:#28735b;
}

.small{
    font-size:13px;
    color:#607871;
}

.resource{
    display:flex;
    justify-content:space-between;
    gap:20px;
}

@media(max-width:700px){

    header{
        display:block;
    }

    header button{
        margin-top:10px;
    }

    .event,
    .resource{
        display:block;
    }

    .eventActions{
        margin-top:15px;
    }

    .formGrid{
        grid-template-columns:1fr;
    }

    .full{
        grid-column:auto;
    }

}

</style>

</head>


<body>


<header>

<div>

<h1>
CampusConnect
</h1>

<div id="userInfo">
Loading...
</div>

</div>


<button
id="logoutButton"
>
Logout
</button>

</header>


<main>


<div class="nav">

<button
id="eventsTab"
>
Events
</button>


<button
id="resourcesTab"
>
Resources
</button>


<button
id="dashboardTab"
>
Dashboard
</button>

</div>


<!-- EVENTS -->

<section
id="eventsSection"
>

<div class="card">

<h2>
Events
</h2>

<div class="formGrid">

<input
id="eventSearch"
placeholder="Search by title, category or location"
>

<select
id="eventCategorySearch"
>

<option value="">
All Categories
</option>

<option>
Workshop
</option>

<option>
Hackathon
</option>

<option>
Seminar
</option>

<option>
Placement
</option>

<option>
Other
</option>

</select>

<button
id="searchEventsButton"
>
Search
</button>

</div>

</div>


<!-- ADMIN CREATE -->

<div
id="createEventCard"
class="card hidden"
>

<h2>
Create Event
</h2>

<div class="formGrid">

<input
id="newEventTitle"
placeholder="Event title"
>

<input
id="newEventCategory"
placeholder="Category"
>

<textarea
id="newEventDescription"
class="full"
placeholder="Event description"
></textarea>

<input
id="newEventDate"
type="datetime-local"
>

<input
id="newEventLocation"
placeholder="Location"
>

<input
id="newEventCapacity"
type="number"
min="1"
placeholder="Number of seats"
>

<button
id="createEventButton"
class="full"
>
Create Event
</button>

</div>

<p
id="createEventMessage"
></p>

</div>


<div id="eventsList">
Loading...
</div>

</section>


<!-- RESOURCES -->

<section
id="resourcesSection"
class="hidden"
>

<div class="card">

<h2>
Resources
</h2>

<div class="formGrid">

<input
id="resourceSearch"
placeholder="Search resources"
>

<button
id="searchResourcesButton"
>
Search
</button>

</div>

</div>


<!-- ADMIN RESOURCE FORM -->

<div
id="createResourceCard"
class="card hidden"
>

<h2>
Add Resource
</h2>

<div class="formGrid">

<input
id="newResourceTitle"
placeholder="Resource title"
>

<input
id="newResourceSubject"
placeholder="Subject"
>

<input
id="newResourceSemester"
placeholder="Semester"
>

<input
id="newResourceFileName"
placeholder="File name"
>

<input
id="newResourceFileUrl"
class="full"
placeholder="PDF/DOCX file URL"
>

<button
id="createResourceButton"
class="full"
>
Add Resource
</button>

</div>

<p class="small">
Enter a local/server URL or online file URL.
</p>

<p
id="resourceMessage"
></p>

</div>


<div id="resourcesList">
Loading...
</div>

</section>


<!-- DASHBOARD -->

<section
id="dashboardSection"
class="hidden"
>

<div id="dashboardContent">
Loading...
</div>

</section>


</main>


<script>


let currentUser = null;


/* =========================================================
   API
========================================================= */

async function api(
    url,
    options
){

    options =
        options || {};


    const config = {

        ...options,

        credentials:
            "include",

        headers:{
            "Content-Type":
                "application/json",

            ...(options.headers || {})

        }

    };


    const response =
        await fetch(
            url,
            config
        );


    let result;


    try{

        result =
            await response.json();

    }
    catch(error){

        throw new Error(
            "Invalid server response."
        );

    }


    if(
        response.status ===
        401
    ){

        localStorage.removeItem(
            "campusconnectUser"
        );

        window.location.href =
            "/";

        throw new Error(
            "Session expired."
        );

    }


    if(!response.ok){

        throw new Error(
            result.message ||
            "Request failed."
        );

    }


    return result;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function safe(value){

    return String(
        value || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   LOAD CURRENT USER
========================================================= */

async function loadUser(){

    const result =
        await api(
            "/api/auth/me"
        );


    currentUser =
        result.user;


    localStorage.setItem(
        "campusconnectUser",
        JSON.stringify(
            currentUser
        )
    );


    document
        .getElementById(
            "userInfo"
        )
        .textContent =

        currentUser.name +
        " | " +
        currentUser.role;


    if(
        currentUser.role ===
        "ADMIN"
    ){

        document
            .getElementById(
                "createEventCard"
            )
            .classList.remove(
                "hidden"
            );


        document
            .getElementById(
                "createResourceCard"
            )
            .classList.remove(
                "hidden"
            );

    }

}


/* =========================================================
   SECTIONS
========================================================= */

function showSection(
    section
){

    document
        .getElementById(
            "eventsSection"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "resourcesSection"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "dashboardSection"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            section
        )
        .classList.remove(
            "hidden"
        );


    if(
        section ===
        "eventsSection"
    ){

        loadEvents();

    }


    if(
        section ===
        "resourcesSection"
    ){

        loadResources();

    }


    if(
        section ===
        "dashboardSection"
    ){

        loadDashboard();

    }

}


document
    .getElementById(
        "eventsTab"
    )
    .onclick =
        function(){

            showSection(
                "eventsSection"
            );

        };


document
    .getElementById(
        "resourcesTab"
    )
    .onclick =
        function(){

            showSection(
                "resourcesSection"
            );

        };


document
    .getElementById(
        "dashboardTab"
    )
    .onclick =
        function(){

            showSection(
                "dashboardSection"
            );

        };


/* =========================================================
   LOGOUT
========================================================= */

document
    .getElementById(
        "logoutButton"
    )
    .onclick =
        async function(){

            try{

                await api(
                    "/api/auth/logout",
                    {
                        method:"POST"
                    }
                );

            }
            catch(error){

                console.log(
                    error.message
                );

            }


            localStorage.removeItem(
                "campusconnectUser"
            );


            window.location.href =
                "/";

        };


/* =========================================================
   LOAD EVENTS
========================================================= */

async function loadEvents(){

    const list =
        document.getElementById(
            "eventsList"
        );


    list.innerHTML =
        "<div class='card'>Loading events...</div>";


    try{

        const search =
            document
                .getElementById(
                    "eventSearch"
                )
                .value
                .trim();


        const category =
            document
                .getElementById(
                    "eventCategorySearch"
                )
                .value;


        const params =
            new URLSearchParams();


        if(search){

            params.set(
                "q",
                search
            );

        }


        if(category){

            params.set(
                "q",
                category
            );

        }


        const result =
            await api(
                "/api/events?" +
                params.toString()
            );


        if(
            !result.data ||
            result.data.length === 0
        ){

            list.innerHTML =
                "<div class='card'>" +
                "<p>No events available.</p>" +
                "</div>";

            return;

        }


        let html = "";


        result.data.forEach(
            function(event){

                let action = "";


                if(
                    currentUser.role ===
                    "STUDENT"
                ){

                    if(
                        event.registered
                    ){

                        action =

                            "<button " +
                            "class='green' " +
                            "onclick=\"unregisterEvent('" +
                            event.id +
                            "')\">" +

                            "Unregister" +

                            "</button>";

                    }
                    else if(
                        event.seatsLeft >
                        0
                    ){

                        action =

                            "<button " +
                            "onclick=\"registerEvent('" +
                            event.id +
                            "')\">" +

                            "Register" +

                            "</button>";

                    }
                    else{

                        action =
                            "<button disabled>" +
                            "Event Full" +
                            "</button>";

                    }

                }


                if(
                    currentUser.role ===
                    "ADMIN"
                ){

                    action =

                        "<button " +
                        "onclick=\"editEvent('" +
                        event.id +
                        "')\">" +

                        "Edit" +

                        "</button>" +

                        "<button " +
                        "class='red' " +
                        "onclick=\"deleteEvent('" +
                        event.id +
                        "')\">" +

                        "Delete" +

                        "</button>";

                }


                html +=

                    "<div class='event'>" +

                    "<div>" +

                    "<h3>" +
                    safe(event.title) +
                    "</h3>" +

                    "<p>" +
                    safe(
                        event.description
                    ) +
                    "</p>" +

                    "<p>" +
                    "<b>Date:</b> " +
                    new Date(
                        event.date
                    ).toLocaleString() +
                    "</p>" +

                    "<p>" +
                    "<b>Category:</b> " +
                    safe(
                        event.category
                    ) +
                    "</p>" +

                    "<p>" +
                    "<b>Location:</b> " +
                    safe(
                        event.location
                    ) +
                    "</p>" +

                    "</div>" +

                    "<div class='eventActions'>" +

                    "<p>" +
                    "<b>" +
                    event.seatsLeft +
                    "</b> seats left" +
                    "</p>" +

                    "<p>" +
                    event.registrationCount +
                    " registered" +
                    "</p>" +

                    action +

                    "</div>" +

                    "</div>";

            }
        );


        list.innerHTML =
            html;

    }
    catch(error){

        list.innerHTML =
            "<div class='card'>" +
            "<p class='error'>" +
            safe(
                error.message
            ) +
            "</p>" +
            "</div>";

    }

}


/* =========================================================
   SEARCH EVENTS
========================================================= */

document
    .getElementById(
        "searchEventsButton"
    )
    .onclick =
        loadEvents;


/* =========================================================
   CREATE EVENT
========================================================= */

document
    .getElementById(
        "createEventButton"
    )
    .onclick =
        async function(){

            const message =
                document
                    .getElementById(
                        "createEventMessage"
                    );


            try{

                const title =
                    document
                        .getElementById(
                            "newEventTitle"
                        )
                        .value
                        .trim();


                const category =
                    document
                        .getElementById(
                            "newEventCategory"
                        )
                        .value
                        .trim();


                const description =
                    document
                        .getElementById(
                            "newEventDescription"
                        )
                        .value
                        .trim();


                const date =
                    document
                        .getElementById(
                            "newEventDate"
                        )
                        .value;


                const eventLocation =
                    document
                        .getElementById(
                            "newEventLocation"
                        )
                        .value
                        .trim();


                const capacity =
                    document
                        .getElementById(
                            "newEventCapacity"
                        )
                        .value;


                if(
                    !title ||
                    !category ||
                    !description ||
                    !date ||
                    !eventLocation ||
                    !capacity
                ){

                    throw new Error(
                        "Please fill all event fields."
                    );

                }


                await api(
                    "/api/events",
                    {

                        method:"POST",

                        body:
                            JSON.stringify({

                                title:
                                    title,

                                description:
                                    description,

                                date:
                                    date,

                                location:
                                    eventLocation,

                                category:
                                    category,

                                capacity:
                                    Number(
                                        capacity
                                    )

                            })

                    }
                );


                message.className =
                    "success";

                message.textContent =
                    "Event created successfully.";


                document
                    .getElementById(
                        "newEventTitle"
                    )
                    .value = "";

                document
                    .getElementById(
                        "newEventCategory"
                    )
                    .value = "";

                document
                    .getElementById(
                        "newEventDescription"
                    )
                    .value = "";

                document
                    .getElementById(
                        "newEventDate"
                    )
                    .value = "";

                document
                    .getElementById(
                        "newEventLocation"
                    )
                    .value = "";

                document
                    .getElementById(
                        "newEventCapacity"
                    )
                    .value = "";


                loadEvents();

                loadDashboard();

            }
            catch(error){

                message.className =
                    "error";

                message.textContent =
                    error.message;

            }

        };


/* =========================================================
   REGISTER
========================================================= */

async function registerEvent(
    eventId
){

    try{

        await api(
            "/api/events/" +
            eventId +
            "/register",
            {
                method:"POST"
            }
        );


        alert(
            "You are registered successfully."
        );


        loadEvents();

        loadDashboard();

    }
    catch(error){

        alert(
            error.message
        );

    }

}


/* =========================================================
   UNREGISTER
========================================================= */

async function unregisterEvent(
    eventId
){

    try{

        await api(
            "/api/events/" +
            eventId +
            "/register",
            {
                method:"DELETE"
            }
        );


        alert(
            "Registration cancelled."
        );


        loadEvents();

        loadDashboard();

    }
    catch(error){

        alert(
            error.message
        );

    }

}


/* =========================================================
   EDIT EVENT
========================================================= */

async function editEvent(
    eventId
){

    try{

        const result =
            await api(
                "/api/events"
            );


        const event =
            result.data.find(
                item =>
                    item.id ===
                    eventId
            );


        if(!event){

            throw new Error(
                "Event not found."
            );

        }


        const title =
            prompt(
                "Event title:",
                event.title
            );


        if(title === null){

            return;

        }


        const description =
            prompt(
                "Description:",
                event.description
            );


        if(description === null){

            return;

        }


        const date =
            prompt(
                "Date:",
                event.date
            );


        if(date === null){

            return;

        }


        const eventLocation =
            prompt(
                "Location:",
                event.location
            );


        if(eventLocation === null){

            return;

        }


        const category =
            prompt(
                "Category:",
                event.category
            );


        if(category === null){

            return;

        }


        const capacity =
            prompt(
                "Capacity:",
                event.capacity
            );


        if(capacity === null){

            return;

        }


        await api(
            "/api/events/" +
            eventId,
            {

                method:"PUT",

                body:
                    JSON.stringify({

                        title:
                            title,

                        description:
                            description,

                        date:
                            date,

                        location:
                            eventLocation,

                        category:
                            category,

                        capacity:
                            Number(
                                capacity
                            )

                    })

            }
        );


        alert(
            "Event updated successfully."
        );


        loadEvents();

    }
    catch(error){

        alert(
            error.message
        );

    }

}


/* =========================================================
   DELETE EVENT
========================================================= */

async function deleteEvent(
    eventId
){

    if(
        !confirm(
            "Delete this event?"
        )
    ){

        return;

    }


    try{

        await api(
            "/api/events/" +
            eventId,
            {
                method:"DELETE"
            }
        );


        alert(
            "Event deleted successfully."
        );


        loadEvents();

        loadDashboard();

    }
    catch(error){

        alert(
            error.message
        );

    }

}


/* =========================================================
   LOAD RESOURCES
========================================================= */

async function loadResources(){

    const list =
        document.getElementById(
            "resourcesList"
        );


    list.innerHTML =
        "<div class='card'>Loading resources...</div>";


    try{

        const search =
            document
                .getElementById(
                    "resourceSearch"
                )
                .value
                .trim();


        const result =
            await api(
                "/api/resources?q=" +
                encodeURIComponent(
                    search
                )
            );


        if(
            !result.data ||
            result.data.length === 0
        ){

            list.innerHTML =
                "<div class='card'>" +
                "<p>No resources available.</p>" +
                "</div>";

            return;

        }


        let html = "";


        result.data.forEach(
            function(resource){

                let adminButton = "";


                if(
                    currentUser.role ===
                    "ADMIN"
                ){

                    adminButton =

                        "<button " +
                        "class='red' " +
                        "onclick=\"deleteResource('" +
                        resource.id +
                        "')\">" +

                        "Delete" +

                        "</button>";

                }


                html +=

                    "<div class='resource'>" +

                    "<div>" +

                    "<h3>" +
                    safe(
                        resource.title
                    ) +
                    "</h3>" +

                    "<p>" +
                    "<b>Subject:</b> " +
                    safe(
                        resource.subject
                    ) +
                    "</p>" +

                    "<p>" +
                    "<b>Semester:</b> " +
                    safe(
                        resource.semester
                    ) +
                    "</p>" +

                    "<p>" +

                    "<a href='" +
                    safe(
                        resource.fileUrl
                    ) +
                    "' target='_blank'>" +

                    "View / Download " +
                    safe(
                        resource.fileName
                    ) +

                    "</a>" +

                    "</p>" +

                    "</div>" +

                    adminButton +

                    "</div>";

            }
        );


        list.innerHTML =
            html;

    }
    catch(error){

        list.innerHTML =
            "<div class='card'>" +
            "<p class='error'>" +
            safe(
                error.message
            ) +
            "</p>" +
            "</div>";

    }

}


/* =========================================================
   SEARCH RESOURCES
========================================================= */

document
    .getElementById(
        "searchResourcesButton"
    )
    .onclick =
        loadResources;


/* =========================================================
   CREATE RESOURCE
========================================================= */

document
    .getElementById(
        "createResourceButton"
    )
    .onclick =
        async function(){

            const message =
                document
                    .getElementById(
                        "resourceMessage"
                    );


            try{

                const title =
                    document
                        .getElementById(
                            "newResourceTitle"
                        )
                        .value
                        .trim();


                const subject =
                    document
                        .getElementById(
                            "newResourceSubject"
                        )
                        .value
                        .trim();


                const semester =
                    document
                        .getElementById(
                            "newResourceSemester"
                        )
                        .value
                        .trim();


                const fileName =
                    document
                        .getElementById(
                            "newResourceFileName"
                        )
                        .value
                        .trim();


                const fileUrl =
                    document
                        .getElementById(
                            "newResourceFileUrl"
                        )
                        .value
                        .trim();


                if(
                    !title ||
                    !subject ||
                    !semester ||
                    !fileName
                ){

                    throw new Error(
                        "Please fill all resource fields."
                    );

                }


                await api(
                    "/api/resources",
                    {

                        method:"POST",

                        body:
                            JSON.stringify({

                                title:
                                    title,

                                subject:
                                    subject,

                                semester:
                                    semester,

                                fileName:
                                    fileName,

                                fileUrl:
                                    fileUrl

                            })

                    }
                );


                message.className =
                    "success";

                message.textContent =
                    "Resource added successfully.";


                document
                    .getElementById(
                        "newResourceTitle"
                    )
                    .value = "";

                document
                    .getElementById(
                        "newResourceSubject"
                    )
                    .value = "";

                document
                    .getElementById(
                        "newResourceSemester"
                    )
                    .value = "";

                document
                    .getElementById(
                        "newResourceFileName"
                    )
                    .value = "";

                document
                    .getElementById(
                        "newResourceFileUrl"
                    )
                    .value = "";


                loadResources();

                loadDashboard();

            }
            catch(error){

                message.className =
                    "error";

                message.textContent =
                    error.message;

            }

        };


/* =========================================================
   DELETE RESOURCE
========================================================= */

async function deleteResource(
    resourceId
){

    if(
        !confirm(
            "Delete this resource?"
        )
    ){

        return;

    }


    try{

        await api(
            "/api/resources/" +
            resourceId,
            {
                method:"DELETE"
            }
        );


        alert(
            "Resource deleted successfully."
        );


        loadResources();

        loadDashboard();

    }
    catch(error){

        alert(
            error.message
        );

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard(){

    const content =
        document.getElementById(
            "dashboardContent"
        );


    content.innerHTML =
        "<div class='card'>Loading dashboard...</div>";


    try{

        if(
            currentUser.role ===
            "ADMIN"
        ){

            const result =
                await api(
                    "/api/dashboard/admin"
                );


            content.innerHTML =

                "<h2>Admin Dashboard</h2>" +

                "<div class='metrics'>" +

                "<div class='metric'>" +
                "<strong>" +
                result.totalEvents +
                "</strong>" +
                "Events" +
                "</div>" +

                "<div class='metric'>" +
                "<strong>" +
                result.totalRegistrations +
                "</strong>" +
                "Registrations" +
                "</div>" +

                "<div class='metric'>" +
                "<strong>" +
                result.totalResources +
                "</strong>" +
                "Resources" +
                "</div>" +

                "<div class='metric'>" +
                "<strong>" +
                result.totalStudents +
                "</strong>" +
                "Students" +
                "</div>" +

                "<div class='metric'>" +
                "<strong>" +
                result.totalAdmins +
                "</strong>" +
                "Admins" +
                "</div>" +

                "</div>";

        }
        else{

            const result =
                await api(
                    "/api/dashboard/student"
                );


            let eventHTML = "";


            if(
                result.events.length ===
                0
            ){

                eventHTML =
                    "<div class='card'>" +
                    "<p>No registered events yet.</p>" +
                    "</div>";

            }
            else{

                result.events.forEach(
                    function(event){

                        eventHTML +=

                            "<div class='card'>" +

                            "<h3>" +
                            safe(
                                event.title
                            ) +
                            "</h3>" +

                            "<p>" +
                            "<b>Date:</b> " +
                            new Date(
                                event.date
                            ).toLocaleString() +
                            "</p>" +

                            "<p>" +
                            "<b>Location:</b> " +
                            safe(
                                event.location
                            ) +
                            "</p>" +

                            "</div>";

                    }
                );

            }


            content.innerHTML =

                "<h2>Student Dashboard</h2>" +

                "<div class='metrics'>" +

                "<div class='metric'>" +

                "<strong>" +

                result
                    .registrations
                    .length +

                "</strong>" +

                "My Registrations" +

                "</div>" +

                "</div>" +

                "<h3>Registration History</h3>" +

                eventHTML;

        }

    }
    catch(error){

        content.innerHTML =
            "<div class='card'>" +
            "<p class='error'>" +
            safe(
                error.message
            ) +
            "</p>" +
            "</div>";

    }

}


/* =========================================================
   START
========================================================= */

async function startPortal(){

    try{

        await loadUser();

        showSection(
            "eventsSection"
        );

    }
    catch(error){

        console.error(
            error
        );

        window.location.href =
            "/";

    }

}


startPortal();


</script>

</body>

</html>

        `);

    }
);


/* =========================================================
   404 HANDLER
========================================================= */

app.use(
    (req, res) => {

        if(
            req.path.startsWith(
                "/api/"
            )
        ){

            return res.status(404).json({

                message:
                    "API endpoint not found."

            });

        }


        res.status(404).send(
            "<h1>404 - Page Not Found</h1>"
        );

    }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            error
        );


        res.status(500).json({

            message:
                "Internal server error."

        });

    }
);


/* =========================================================
   START SERVER
========================================================= */

if(
    require.main ===
    module
){

    app.listen(
        PORT,
        () => {

            console.log(
                "===================================="
            );

            console.log(
                "CampusConnect is running!"
            );

            console.log(
                "http://localhost:" +
                PORT
            );

            console.log(
                "===================================="
            );

            console.log(
                "Data file:"
            );

            console.log(
                DATA_FILE
            );

        }
    );

}


module.exports = {
    app,
    store
};