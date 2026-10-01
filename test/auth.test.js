const request = require("supertest");

describe("CampusConnect Authentication API", () => {

    test("Login should reject invalid credentials", async () => {
        const response = await request("http://localhost:5000")
            .post("/api/auth/login")
            .send({
                email: "wrong@test.com",
                password: "wrongpassword"
            });

        expect(response.statusCode).toBe(401);
    });

    test("Protected profile route should reject request without token", async () => {
        const response = await request("http://localhost:5000")
            .get("/api/auth/profile");

        expect(response.statusCode).toBe(401);
    });

    test("Admin route should reject request without token", async () => {
        const response = await request("http://localhost:5000")
            .get("/api/auth/admin");

        expect(response.statusCode).toBe(401);
    });

});