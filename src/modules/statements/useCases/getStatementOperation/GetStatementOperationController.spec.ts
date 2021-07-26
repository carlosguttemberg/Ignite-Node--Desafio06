import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import { createConnection } from 'typeorm';

let connection: Connection;

describe("Get Statement Operation Controller", () => {
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

  it("should be able to get statement operation", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@admin.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = deposit.body;

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 5,
        description: "Test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
                          .get(`/api/v1/statements/${id}`)
                          .set({
                            Authorization: `Bearer ${token}`,
                          });

    expect(response.body.id).toBe(id);
  });
})
