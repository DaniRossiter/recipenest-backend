const request = require("supertest");
const app = require("../server");
const db = require("../db");


describe("GET /api/recipes", () => {
  it("should return an array of recipes", async () => {
    const res = await request(app).get("/api/recipes");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

afterAll(async () => {
  await db.end(); // Closes the database pool
});
