import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as networkController from "@controllers/networkController";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@services/authService");
jest.mock("@controllers/networkController");

describe("NetworksRoutes integration", () => {
  const BASE_URL = "/api/v1/networks";
  const token = "Bearer faketoken";
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  // === AUTHENTICATION TESTS (401) ===
  describe("Authentication", () => {
    it("should return 401 if no Authorization header is present", async () => {
      const response = await request(app).get(BASE_URL);
      expect(response.status).toBe(401);
    });

    it("should return 401 if token format is invalid", async () => {
      const response = await request(app).get(BASE_URL).set("Authorization", "InvalidTokenFormat");
      expect(response.status).toBe(401);
    });

    it("should return 401 on UnauthorizedError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app).get(BASE_URL).set("Authorization", "Bearer invalid");
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });
  });

  // === AUTHORIZATION TESTS (403) ===
  describe("Authorization", () => {
    beforeEach(() => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });
    });

    it("should return 403 when creating a network without permission", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", token)
        .send({ code: "NET01", name: "Test" });
      expect(response.status).toBe(403);
    });

    it("should return 403 when updating a network without permission", async () => {
      const response = await request(app)
        .patch(`${BASE_URL}/NET01`)
        .set("Authorization", token)
        .send({ code: "NET01", name: "Updated" });
      expect(response.status).toBe(403);
    });

    it("should return 403 when deleting a network without permission", async () => {
      const response = await request(app)
        .delete(`${BASE_URL}/NET01`)
        .set("Authorization", token);
      expect(response.status).toBe(403);
    });
  });

  // === GET TESTS ===
  describe("GET requests", () => {
    it("should return all networks", async () => {
      const mockNetworks = [
        { code: "NET01", name: "Network 1", description: "desc" },
        { code: "NET02", name: "Network 2", description: "desc" },
      ];

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.getAllNetworks as jest.Mock).mockResolvedValue(mockNetworks);

      const response = await request(app).get(BASE_URL).set("Authorization", token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNetworks);
    });

    it("should return a network by code", async () => {
      const mockNetwork = { code: "NET01", name: "Network 1", description: "desc" };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.getNetworkByCode as jest.Mock).mockResolvedValue(mockNetwork);

      const response = await request(app).get(`${BASE_URL}/NET01`).set("Authorization", token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNetwork);
    });

    it("should handle special characters in network code", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.getNetworkByCode as jest.Mock).mockResolvedValue({
        code: "NET-01",
        name: "Test",
        description: "desc",
      });

      const response = await request(app).get(`${BASE_URL}/NET-01`).set("Authorization", token);
      expect(response.status).toBe(200);
    });
  });

  // === POST TESTS ===
  describe("POST requests", () => {
    it("should create a new network", async () => {
      const newNetwork = { code: "NET03", name: "Network 3", description: "desc" };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.createNewNetwork as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).post(BASE_URL).set("Authorization", token).send(newNetwork);
      expect(response.status).toBe(201);
    });

    it("should return 400 if required fields are missing", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).post(BASE_URL).set("Authorization", token).send({});
      expect(response.status).toBe(400);
    });

    it("should return 400 if content-type is invalid", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", token)
        .set("Content-Type", "application/json")
        .send("invalid data");

      expect(response.status).toBe(400);
    });

    it("should return 409 if network already exists", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.createNewNetwork as jest.Mock).mockImplementation(() => {
        throw new ConflictError("Entity with code NET01 already exists");
      });

      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", token)
        .send({ code: "NET01", name: "Test" });

      expect(response.status).toBe(409);
    });
  });

  // === PATCH TESTS ===
  describe("PATCH requests", () => {
    it("should update a network", async () => {
      const updateNetwork = { code: "NET01", name: "Updated", description: "desc" };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.updateNetwork as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .patch(`${BASE_URL}/NET01`)
        .set("Authorization", token)
        .send(updateNetwork);

      expect(response.status).toBe(204);
    });

    it("should return 400 if body is invalid", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
        throw Object.assign(new Error("Invalid body"), { status: 400 });
      });
      const response = await request(app)
        .patch(`${BASE_URL}/NET01`)
        .set("Authorization", token)
        .send({ invalidField: "invalid" });

      expect(response.status).toBe(400);
    });

    it("should return 404 if network does not exist", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Entity not found");
      });

      const response = await request(app)
        .patch(`${BASE_URL}/NONEXISTENT`)
        .set("Authorization", token)
        .send({ code: "NET01", name: "Test" });

      expect(response.status).toBe(404);
    });

    it("should return 409 on conflict", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
        throw new ConflictError("Entity with code NET02 already exists");
      });

      const response = await request(app)
        .patch(`${BASE_URL}/NET01`)
        .set("Authorization", token)
        .send({ code: "NET02", name: "Test" });

      expect(response.status).toBe(409);
    });
  });

  // === DELETE TESTS ===
  describe("DELETE requests", () => {
    it("should delete a network", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.deleteNetwork as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`${BASE_URL}/NET01`)
        .set("Authorization", token);

      expect(response.status).toBe(204);
    });

    it("should return 404 if network not found", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.deleteNetwork as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Entity not found");
      });

      const response = await request(app)
        .delete(`${BASE_URL}/NONEXISTENT`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
    });
  });

  // === SERVER ERROR TESTS (500) ===
  describe("Internal Server Errors", () => {
    it("should return 500 on unhandled errors", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.getAllNetworks as jest.Mock).mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const response = await request(app).get(BASE_URL).set("Authorization", token);
      expect(response.status).toBe(500);
    });
  });
});
