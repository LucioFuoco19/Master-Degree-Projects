import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

const USERS_URL = "users";
const BASE_URL = "/api/v1/";

describe(`GET ${USERS_URL}/ (e2e)`, () => {
  let token: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("get all users", async () => {
    const res = await request(app)
      .get(`${BASE_URL + USERS_URL}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(6);

    const usernames = res.body.map((u: any) => u.username).sort();
    const types = res.body.map((u: any) => u.type).sort();

    expect(usernames).toEqual(["admin","admin2","operator","operator2", "viewer","viewer2"]);
    expect(types).toEqual(["admin","admin", "operator", "operator", "viewer", "viewer"]);
  });

  it("return 401 for missing token", async () => {
    const res = await request(app)
      .get(`${BASE_URL + USERS_URL}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("code",401);
    expect(res.body).toHaveProperty("name", "UnauthorizedError");
    expect(res.body).toHaveProperty("message");
  });

  it("should return 403 for insufficient rights", async () => {
    const viewerToken = generateToken(TEST_USERS.viewer);

    const res = await request(app)
      .get(`${BASE_URL + USERS_URL}`)
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("code",403);
    expect(res.body).toHaveProperty("name", "InsufficientRightsError");
    expect(res.body).toHaveProperty("message");
  });

});

//POST : /users create an user
describe(`POST ${USERS_URL}/ (e2e)`, () => {
  let token: string;
  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("create a new user", async () => {
    let newUser = {
      username : "username3",
      password : "password",
      type : "admin"
      
    }
    const res = await request(app)
      .post(`${BASE_URL + USERS_URL}`)
      .set("Authorization", `Bearer ${token}`)
      .send(newUser);

    expect(res.status).toBe(201); // Created
  });

  it("return 400 for empty username", async () => {
    const invalidUser = {
      username: "",
      password: "password",
      type: "admin"
    };

    const res = await request(app)
      .post(`${BASE_URL + USERS_URL}`)
      .set("Authorization", `Bearer ${token}`)
      .send(invalidUser);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("code",400);
    expect(res.body).toHaveProperty("name", "BadRequest");
    expect(res.body).toHaveProperty("message");
  });

  it("return 400 for too short password", async () => {
    const invalidUser = {
      username: "shortPassUser",
      password: "123",
      type: "admin"
    };

    const res = await request(app)
      .post(`${BASE_URL + USERS_URL}`)
      .set("Authorization", `Bearer ${token}`)
      .send(invalidUser);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("code",400);
    expect(res.body).toHaveProperty("name", "BadRequest");
    expect(res.body).toHaveProperty("message");
  });

  it("return 400 for missing fields", async () => {
    const invalidUser = {
      username: "missingType"
    };

    const res = await request(app)
      .post(`${BASE_URL + USERS_URL}`)
      .set("Authorization", `Bearer ${token}`)
      .send(invalidUser);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("code",400);
    expect(res.body).toHaveProperty("name", "BadRequest");
    expect(res.body).toHaveProperty("message");
  });

  it("return 401 for missing token", async () => {

    const res = await request(app)
      .post(`${BASE_URL + USERS_URL}`)
      .send(TEST_USERS.admin);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("code",401);
    expect(res.body).toHaveProperty("name", "UnauthorizedError");
    expect(res.body).toHaveProperty("message");
  });

  it("return 403 for insufficient rights", async () => {
    const viewerToken = generateToken(TEST_USERS.viewer);


    const res = await request(app)
      .post(`${BASE_URL + USERS_URL}`)
      .set("Authorization", `Bearer ${viewerToken}`)
      .send(TEST_USERS.viewer);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("code",403);
    expect(res.body).toHaveProperty("name", "InsufficientRightsError");
    expect(res.body).toHaveProperty("message");
  });

  it("should return 409 for duplicate username", async () => {
    const newUser = {
      username: "admin", //admin already exists
      password: "AnotherPass123!",
      type: "operator"
    };

    const res = await request(app)
      .post(`${BASE_URL + USERS_URL}`)
      .set("Authorization", `Bearer ${token}`)
      .send(newUser);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("code",409);
    expect(res.body).toHaveProperty("name", "ConflictError");
    expect(res.body).toHaveProperty("message");
  });

});

describe(`GET ${USERS_URL}/${TEST_USERS.admin2.username} (e2e)`, () => {
  let token: string;
  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("retrieve a specific user", async () => {


    const res = await request(app)
      .get(`${BASE_URL + USERS_URL + "/" +  TEST_USERS.admin2.username}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("username", `${TEST_USERS.admin2.username}`);
    expect(res.body).toHaveProperty("type", "admin");
  });

  it("return 401 for missing token", async () => {
    const res = await request(app)
      .get(`${BASE_URL + USERS_URL + "/" +  TEST_USERS.admin2.username}`)

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("code",401);
    expect(res.body).toHaveProperty("name", "UnauthorizedError");
    expect(res.body).toHaveProperty("message");
  });

  it("return 403 for insufficient rights", async () => {
    const viewerToken = generateToken(TEST_USERS.viewer);

    const res = await request(app)
      .get(`${BASE_URL + USERS_URL + "/" +  TEST_USERS.admin2.username}`)
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("code",403);
    expect(res.body).toHaveProperty("name", "InsufficientRightsError");
    expect(res.body).toHaveProperty("message");
  });

  it("return 404 if user not found", async () => {
    const fakeUSer = {
      username : "s345"
    }
    const res = await request(app)
      .get(`${BASE_URL + USERS_URL}/${fakeUSer.username}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("code",404);
    expect(res.body).toHaveProperty("name", "NotFoundError");
    expect(res.body).toHaveProperty("message");
  });
});

describe(`DELETE ${USERS_URL}/${TEST_USERS.admin2.username}`, () => {
  let token: string;
  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("delete a user and return 204", async () => {

    const res = await request(app)
      .delete(`${BASE_URL + USERS_URL + "/" +  TEST_USERS.admin2.username}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it("return 401 for missing token", async () => {
    const res = await request(app)
      .delete(`${BASE_URL + USERS_URL + "/" +  TEST_USERS.admin2.username}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("code",401);
    expect(res.body).toHaveProperty("name", "UnauthorizedError");
    expect(res.body).toHaveProperty("message");
  });

  it("return 403 for insufficient rights", async () => {
    const viewerToken = generateToken(TEST_USERS.viewer);

    const res = await request(app)
      .delete(`${BASE_URL + USERS_URL + "/" +  TEST_USERS.admin2.username}`)
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("code",403);
    expect(res.body).toHaveProperty("name", "InsufficientRightsError");
    expect(res.body).toHaveProperty("message");
  });

  it("return 404 if user not found", async () => {
    const fakeUSer = {
      username : "b"
    }
    const res = await request(app)
      .delete(`${BASE_URL + USERS_URL + "/" + fakeUSer.username}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("code",404);
    expect(res.body).toHaveProperty("name", "NotFoundError");
    expect(res.body).toHaveProperty("message");
  });
  
});

