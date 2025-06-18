const request = require("supertest");
const app = require("../server");
const db = require("../db");

const testUser = {
  username: "TestUser",
  email: "testuser@example.com",
  password: "testpassword123"
};

describe("Auth Routes", () => {
  afterAll(async () => {
    // Clean up the test user if it exists
    await db.query("DELETE FROM users WHERE email = $1", [testUser.email]);
    await db.end();
  });

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body.user).toHaveProperty("email", testUser.email);
  });

  it("should login an existing user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", testUser.email);
  });
});
