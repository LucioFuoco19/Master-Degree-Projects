import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS } from "@test/e2e/lifecycle";

describe("Networks E2E", () => {
  let token: string;
  let operatorToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  // ----------------------------------------
  // GET /networks
  // ----------------------------------------
  describe("GET /networks", () => {
    it("should return 200 and all networks", async () => {
      const res = await request(app)
        .get("/api/v1/networks")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const codes = res.body.map((n: any) => n.code);
      expect(codes).toEqual(
        expect.arrayContaining([TEST_NETWORKS.net01.code, TEST_NETWORKS.net02.code])
      );
    });

    it("should return 401 if no token is provided", async () => {
      const res = await request(app).get("/api/v1/networks");
      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      const res = await request(app)
        .get("/api/v1/networks")
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
    });
  });

  // ----------------------------------------
  // GET /networks/:networkCode
  // ----------------------------------------
  describe("GET /networks/:networkCode", () => {
    it("should return 200 and the network details", async () => {
      const res = await request(app)
        .get(`/api/v1/networks/${TEST_NETWORKS.net01.code}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(TEST_NETWORKS.net01.code);
      expect(res.body.name).toBe(TEST_NETWORKS.net01.name);
      expect(res.body.description).toBe(TEST_NETWORKS.net01.description);
    });

    it("should return 401 if no token is provided", async () => {
      const res = await request(app).get(`/api/v1/networks/${TEST_NETWORKS.net01.code}`);
      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      const res = await request(app)
        .get(`/api/v1/networks/${TEST_NETWORKS.net01.code}`)
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
    });

    it("should return 404 if network does not exist", async () => {
      const res = await request(app)
        .get("/api/v1/networks/NOTFOUND")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe(404);
    });
  });

  // ----------------------------------------
  // POST /networks
  // ----------------------------------------
  describe("POST /networks", () => {
    it("should create a new network", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${token}`)
        .send(TEST_NETWORKS.net_new);

      expect(res.status).toBe(201);
    });

    it("should return 401 if no token is provided", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .send(TEST_NETWORKS.net_x);
      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", "Bearer invalidtoken")
        .send(TEST_NETWORKS.net_x);
      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
    });

    it("should return 403 if viewer tries to create a network", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${viewerToken}`)
        .send(TEST_NETWORKS.net_x);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
    });

    it("should return 400 if code is missing", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${token}`)
        .send(TEST_NETWORKS.net_malformed);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });

    it("should return 400 if code length is less then the minimum", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${token}`)
        .send(TEST_NETWORKS.net_invalidCodeMinLength);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });

    it("should return 409 if network code already exists", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${token}`)
        .send(TEST_NETWORKS.net01);
      expect(res.status).toBe(409);
      expect(res.body.code).toBe(409);
    });
  });

  // ----------------------------------------
  // PATCH /networks/:networkCode
  // ----------------------------------------
  describe("PATCH /networks/:networkCode", () => {
    it("should return 401 if no token is provided", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${TEST_NETWORKS.net01.code}`)
        .send(TEST_NETWORKS.net_updated);
      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${TEST_NETWORKS.net01.code}`)
        .set("Authorization", "Bearer invalidtoken")
        .send(TEST_NETWORKS.net_updated);
      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
    });

    it("should return 403 if viewer tries to update a network", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${TEST_NETWORKS.net01.code}`)
        .set("Authorization", `Bearer ${viewerToken}`)
        .send(TEST_NETWORKS.net_updated);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
    });

    it("should return 404 if network does not exist", async () => {
      const res = await request(app)
        .patch("/api/v1/networks/NOTFOUND")
        .set("Authorization", `Bearer ${token}`)
        .send(TEST_NETWORKS.net_updated);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe(404);
    });

    it("should return 400 if code is missing", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${TEST_NETWORKS.net01.code}`)
        .set("Authorization", `Bearer ${token}`)
        .send(TEST_NETWORKS.net_malformed);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });

    it("should return 400 if code length is less then the minimum", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${TEST_NETWORKS.net01.code}`)
        .set("Authorization", `Bearer ${token}`)
        .send(TEST_NETWORKS.net_invalidCodeMinLength);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });

    it("should return 409 if new code already exists", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${TEST_NETWORKS.net01.code}`)
        .set("Authorization", `Bearer ${token}`)
        .send(TEST_NETWORKS.net02);
      expect(res.status).toBe(409);
      expect(res.body.code).toBe(409);
    });

    it("should update a network", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${TEST_NETWORKS.net01.code}`)
        .set("Authorization", `Bearer ${token}`)
        .send(TEST_NETWORKS.net_updated);

      expect(res.status).toBe(204);
    });

    // test combination of all updatable fields
    it("should update a network", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${TEST_NETWORKS.net_updated.code}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ code: "NET99" }); // only code is updated

      expect(res.status).toBe(204);
    });
    it("should update a network", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/NET99`)
        .set("Authorization", `Bearer ${token}`)
        .send({ code: "NET99", name: "only the name" }); // only name is updated

      expect(res.status).toBe(204);
    });
    it("should update a network", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/NET99`)
        .set("Authorization", `Bearer ${token}`)
        .send({ code: "N", description: "only the description" }); // only description is updated

      expect(res.status).toBe(204);
    });
  });

  // ----------------------------------------
  // DELETE /networks/:networkCode
  // ----------------------------------------
  describe("DELETE /networks/:networkCode", () => {
    it("should delete a network", async () => {
      const res = await request(app)
        .delete(`/api/v1/networks/${TEST_NETWORKS.net02.code}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it("should return 401 if no token is provided", async () => {
      const res = await request(app)
        .delete(`/api/v1/networks/${TEST_NETWORKS.net01.code}`);
      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      const res = await request(app)
        .delete(`/api/v1/networks/${TEST_NETWORKS.net01.code}`)
        .set("Authorization", "Bearer invalid token");
      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
    });

    it("should return 403 if viewer tries to delete a network", async () => {
      const res = await request(app)
        .delete(`/api/v1/networks/${TEST_NETWORKS.net01.code}`)
        .set("Authorization", `Bearer ${viewerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
    });

    it("should return 404 if network does not exist", async () => {
      const res = await request(app)
        .delete("/api/v1/networks/NOTFOUND")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe(404);
    });
  });
});