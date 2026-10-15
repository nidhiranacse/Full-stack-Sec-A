const { test, before, after } = require("node:test");
const assert = require("node:assert");
const { spawn } = require("node:child_process");
const path = require("node:path");

const PORT = 3099;
const BASE = `http://localhost:${PORT}`;
let proc;

before(async () => {
  proc = spawn("node", [path.join(__dirname, "..", "server.js")], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: "ignore"
  });
  for (let i = 0; i < 40; i++) {
    try { await fetch(`${BASE}/students`); return; } catch { await new Promise(r => setTimeout(r, 150)); }
  }
  throw new Error("server did not start");
});
after(() => proc.kill());

const post = (body) =>
  fetch(`${BASE}/students`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("full CRUD flow", async () => {
  let r = await post({ name: "Aman", email: "aman@example.com", age: 20 });
  assert.equal(r.status, 201);
  const s = await r.json();
  assert.deepEqual(s, { id: 1, name: "Aman", email: "aman@example.com", age: 20 });

  r = await post({ name: "Riya", email: "riya@example.com", age: 17 });
  assert.equal(r.status, 201);

  r = await post({ name: "Dup", email: "AMAN@example.com", age: 30 });
  assert.equal(r.status, 409);

  r = await fetch(`${BASE}/students`);
  assert.equal((await r.json()).length, 2);

  r = await fetch(`${BASE}/students?minAge=18`);
  const f = await r.json();
  assert.equal(f.length, 1);
  assert.equal(f[0].name, "Aman");

  r = await fetch(`${BASE}/students/1`);
  assert.equal(r.status, 200);

  r = await fetch(`${BASE}/students/999`);
  assert.equal(r.status, 404);

  r = await fetch(`${BASE}/students/1`, { method: "DELETE" });
  assert.equal(r.status, 204);
  r = await fetch(`${BASE}/students/1`);
  assert.equal(r.status, 404);
});

test("validation errors return 400", async () => {
  for (const bad of [
    {}, { name: "", email: "a@b.co", age: 20 }, { name: "A", email: "bad", age: 20 },
    { name: "A", email: "a@b.co", age: "20" }, { name: "A", email: "a@b.co", age: -1 },
    { name: "A", email: "a@b.co", age: 1.5 }
  ]) {
    const r = await post(bad);
    assert.equal(r.status, 400, JSON.stringify(bad));
  }
  for (const q of ["abc", "", "-1", "1&minAge=2"]) {
    const r = await fetch(`${BASE}/students?minAge=${q}`);
    assert.equal(r.status, 400, q);
  }
  const r = await fetch(`${BASE}/students`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad" });
  assert.equal(r.status, 400);
});
