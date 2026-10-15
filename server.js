
const http = require("http");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const PORT = 3000;
const SECRET = "my_secret_key";
const users = [];

const server = http.createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json");

    function send(status, data) {
        res.writeHead(status);
        res.end(JSON.stringify(data));
    }

    // Read JSON request body
    let body = "";

    try {
        for await (const chunk of req) {
            body += chunk;
        }

        const data = body ? JSON.parse(body) : {};

        // REGISTER
        if (req.method === "POST" && req.url === "/register") {
            const { username, password } = data;

            if (
                typeof username !== "string" ||
                !username.trim() ||
                typeof password !== "string" ||
                password.length < 6
            ) {
                return send(400, { error: "Invalid input" });
            }

            const name = username.trim();

            if (users.find(u => u.username === name)) {
                return send(409, {
                    error: "Username already exists"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            users.push({
                username: name,
                password: hashedPassword
            });

            return send(201, { message: "User registered" });
        }

        // LOGIN
        if (req.method === "POST" && req.url === "/login") {
            const { username, password } = data;

            const user = users.find(u => u.username === username);

            if (
                !user ||
                typeof password !== "string" ||
                !(await bcrypt.compare(password, user.password))
            ) {
                return send(401, {
                    error: "Invalid credentials"
                });
            }

            const token = jwt.sign(
                { username: user.username },
                SECRET,
                { expiresIn: "1h" }
            );

            return send(200, { token });
        }

        // PROFILE
        if (req.method === "GET" && req.url === "/profile") {
            const auth = req.headers.authorization;

            if (!auth || !auth.startsWith("Bearer ")) {
                return send(401, { error: "Unauthorized" });
            }

            try {
                const token = auth.slice(7);
                const decoded = jwt.verify(token, SECRET);

                return send(200, {
                    username: decoded.username
                });
            } catch {
                return send(401, { error: "Unauthorized" });
            }
        }

        // Unknown route
        return send(404, { error: "Not found" });

    } catch (error) {
        return send(400, { error: "Invalid input" });
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
