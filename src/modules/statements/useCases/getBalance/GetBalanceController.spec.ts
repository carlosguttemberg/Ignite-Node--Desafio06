import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import { createConnection } from 'typeorm';

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at)
     values('${id}', 'admin', 'admin@admin.com', '${password}', 'now()')
    `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@admin.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 5,
        description: "Test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const balance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(balance.status).toBe(200);
    expect(balance.body.statement.length).toBe(2);
    expect(balance.body.statement[0]).toHaveProperty("id");
    expect(balance.body.statement[0].amount).toEqual(10);
    expect(balance.body.balance).toEqual(5);
  });
})
