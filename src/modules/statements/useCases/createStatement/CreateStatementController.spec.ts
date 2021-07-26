import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import { createConnection } from 'typeorm';

let connection: Connection;

describe("Create Statement Controller", () => {
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

  it("should be able to create statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@admin.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseDeposit.status).toBe(201);

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 5,
        description: "Test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.status).toBe(201);
  });
});
