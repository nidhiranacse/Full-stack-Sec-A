const request = require("supertest");

jest.mock("../src/models/User", () => require("./mocks/inMemoryUser"));
jest.mock("../src/models/Event", () => require("./mocks/inMemoryEvent"));
jest.mock("../src/models/Announcement", () => require("./mocks/inMemoryAnnouncement"));

const createApp = require("../src/app");
const User = require("../src/models/User");

const app = createApp();

beforeEach(() => {
  User.__reset();
});

describe("POST /api/auth/register", () => {
  it("registers a new user and returns an access token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Alice Student",
      email: "alice@campus.edu",
      password: "password123",
      role: "STUDENT",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body.user.email).toBe("alice@campus.edu");
    expect(res.body.user.role).toBe("STUDENT");
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects a weak password via zod validation (400)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Bob",
      email: "bob@campus.edu",
      password: "123",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Carol Admin",
      email: "carol@campus.edu",
      password: "supersecret1",
      role: "ADMIN",
    });
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "carol@campus.edu",
      password: "supersecret1",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("fails login with wrong password (401)", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "carol@campus.edu",
      password: "totally-wrong-password",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });
});

describe("Protected routes", () => {
  it("rejects requests to /api/events with no token (401)", async () => {
    const res = await request(app).get("/api/events");
    expect(res.status).toBe(401);
  });

  it("rejects a STUDENT creating an event via an admin-only route (403)", async () => {
    const reg = await request(app).post("/api/auth/register").send({
      name: "Dave Student",
      email: "dave@campus.edu",
      password: "password123",
      role: "STUDENT",
    });
    const token = reg.body.accessToken;
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Tech Fest", date: "2026-10-01" });
    expect(res.status).toBe(403);
  });
});
