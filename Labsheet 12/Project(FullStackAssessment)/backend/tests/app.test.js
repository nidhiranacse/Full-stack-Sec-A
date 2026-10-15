process.env.JWT_SECRET = "test-secret-for-task-manager";

const request = require("supertest");
const app = require("../server");
const { users, tasks, loginAttempts } = require("../store");

beforeEach(() => {
    users.length = 0;
    tasks.length = 0;
    loginAttempts.clear();
});

async function registerAndLogin(email) {
    await request(app)
        .post("/auth/register")
        .send({ email, password: "test12345" })
        .expect(201);

    const response = await request(app)
        .post("/auth/login")
        .send({ email, password: "test12345" })
        .expect(200);

    return response.body.token;
}

describe("Secure Task Manager API", () => {
    test("registers a user and hashes the password", async () => {
        await request(app)
            .post("/auth/register")
            .send({ email: "user@example.com", password: "test12345" })
            .expect(201);

        expect(users[0].password).not.toBe("test12345");
    });

    test("rejects a request without a token", async () => {
        await request(app).get("/tasks").expect(401);
    });

    test("creates a task and returns it in the user's task list", async () => {
        const token = await registerAndLogin("user@example.com");

        await request(app)
            .post("/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Complete assignment", status: "todo" })
            .expect(201);

        const response = await request(app)
            .get("/tasks?page=1&limit=10")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body.total).toBe(1);
        expect(response.body.data[0].title).toBe("Complete assignment");
    });

    test("prevents one user from updating another user's task", async () => {
        const tokenA = await registerAndLogin("a@example.com");
        const tokenB = await registerAndLogin("b@example.com");

        const created = await request(app)
            .post("/tasks")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ title: "Private task", status: "todo" })
            .expect(201);

        await request(app)
            .patch(`/tasks/${created.body.id}`)
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ status: "done" })
            .expect(403);
    });

    test("blocks login after five failed attempts", async () => {
        await registerAndLogin("limit@example.com");

        for (let i = 0; i < 5; i++) {
            await request(app)
                .post("/auth/login")
                .send({ email: "limit@example.com", password: "wrong" })
                .expect(401);
        }

        const response = await request(app)
            .post("/auth/login")
            .send({ email: "limit@example.com", password: "test12345" })
            .expect(429);

        expect(response.headers["retry-after"]).toBeDefined();
    });
});