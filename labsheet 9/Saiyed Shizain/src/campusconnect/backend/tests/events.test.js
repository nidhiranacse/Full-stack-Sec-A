const request = require("supertest");

jest.mock("../src/models/User", () => require("./mocks/inMemoryUser"));
jest.mock("../src/models/Event", () => require("./mocks/inMemoryEvent"));
jest.mock("../src/models/Announcement", () => require("./mocks/inMemoryAnnouncement"));

const createApp = require("../src/app");
const User = require("../src/models/User");
const Event = require("../src/models/Event");

const app = createApp();

async function registerAdmin() {
  const res = await request(app).post("/api/auth/register").send({
    name: "Admin User",
    email: "admin@campus.edu",
    password: "adminpass123",
    role: "ADMIN",
  });
  return res.body.accessToken;
}

beforeEach(() => {
  User.__reset();
  Event.__reset();
});

describe("POST /api/events", () => {
  it("lets an ADMIN create an event successfully (201)", async () => {
    const token = await registerAdmin();
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Annual Tech Fest",
        description: "Coding & robotics",
        date: "2026-11-05",
        venue: "Main Auditorium",
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Annual Tech Fest");
    expect(res.body.createdBy).toBeDefined();
  });
});

describe("GET /api/events", () => {
  it("supports pagination and search-by-title", async () => {
    const token = await registerAdmin();
    await request(app).post("/api/events").set("Authorization", `Bearer ${token}`).send({
      title: "Tech Fest",
      date: "2026-11-05",
    });
    await request(app).post("/api/events").set("Authorization", `Bearer ${token}`).send({
      title: "Cultural Night",
      date: "2026-11-10",
    });
    await request(app).post("/api/events").set("Authorization", `Bearer ${token}`).send({
      title: "Tech Talk Series",
      date: "2026-11-15",
    });
    const res = await request(app)
      .get("/api/events?search=Tech&page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.items.every((e) => e.title.includes("Tech"))).toBe(true);
  });

  it("lets a STUDENT RSVP to an event (200)", async () => {
    const token = await registerAdmin();
    const created = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Tech Fest", date: "2026-11-05" });
    const reg = await request(app).post("/api/auth/register").send({
      name: "Stu Dent",
      email: "stu@campus.edu",
      password: "password123",
      role: "STUDENT",
    });
    const res = await request(app)
      .post(`/api/events/${created.body._id}/rsvp`)
      .set("Authorization", `Bearer ${reg.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.attendees.length).toBe(1);
  });
});
