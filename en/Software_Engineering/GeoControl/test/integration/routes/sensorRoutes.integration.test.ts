import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as sensorController from "@controllers/sensorController";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@services/authService");
jest.mock("@controllers/sensorController");

describe("SensorRoutes integration", () => {
  const BASE_URL = "/api/v1/networks/NET01/gateways/ABC123/sensors";
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

    it("should return 403 when creating a sensor without permission", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", token)
        .send({ macAddress: "00:11:22:33:44:55", name: "temp sens" });
      expect(response.status).toBe(403);
    });

    it("should return 403 when updating a sensor without permission", async () => {
      const response = await request(app)
        .patch(`${BASE_URL}/00:11:22:33:44:55`)
        .set("Authorization", token)
        .send({ name: "temp sens" });
      expect(response.status).toBe(403);
    });

    it("should return 403 when deleting a sensor without permission", async () => {
      const response = await request(app)
        .delete(`${BASE_URL}/00:11:22:33:44:55`)
        .set("Authorization", token);
      expect(response.status).toBe(403);
    });
  });

  // === GET TESTS ===
  describe("GET requests", () => {
    it("should return all sensors", async () => {
      const mockSensors = [
        { mac: "00:11:22:33:44:55", type: "temperature" },
        { mac: "66:77:88:99:AA:BB", type: "humidity" }
      ];

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.getAllSensors as jest.Mock).mockResolvedValue(mockSensors);

      const response = await request(app).get(BASE_URL).set("Authorization", token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSensors);
    });

    it("should return a specific sensor", async () => {
      const mockSensor = { mac: "00:11:22:33:44:55", type: "temperature" };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.getSensor as jest.Mock).mockResolvedValue(mockSensor);

      const response = await request(app)
        .get(`${BASE_URL}/00:11:22:33:44:55`)
        .set("Authorization", token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSensor);
    });
  });

  // === POST TESTS ===
  describe("POST requests", () => {
    it("should create a new sensor", async () => {
      const newSensor = { macAddress: "00:11:22:33:44:55", name: "temp sens" };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.createSensor as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).post(BASE_URL).set("Authorization", token).send(newSensor);
      expect(response.status).toBe(201);
    });

    it("should return 409 if sensor already exists", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.createSensor as jest.Mock).mockImplementation(() => {
        throw new ConflictError("Sensor already exists");
      });

      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", token)
        .send({ macAddress: "00:11:22:33:44:55", name: "temp sens" });
      expect(response.status).toBe(409);
    });
  });

  // === PATCH TESTS ===
  describe("PATCH requests", () => {
    it("should update a sensor", async () => {
      const updateSensor = { type: "humidity" };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .patch(`${BASE_URL}/00:11:22:33:44:55`)
        .set("Authorization", token)
        .send(updateSensor);
      expect(response.status).toBe(204);
    });

    it("should return 404 if sensor not found", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Sensor not found");
      });

      const response = await request(app)
        .patch(`${BASE_URL}/NONEXISTENT`)
        .set("Authorization", token)
        .send({ type: "humidity" });
      expect(response.status).toBe(404);
    });
  });

  // === DELETE TESTS ===
  describe("DELETE requests", () => {
    it("should delete a sensor", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.deleteSensor as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`${BASE_URL}/00:11:22:33:44:55`)
        .set("Authorization", token);
      expect(response.status).toBe(204);
    });

    it("should return 404 if sensor not found", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.deleteSensor as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Sensor not found");
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
      (sensorController.getAllSensors as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected failure");
      });

      const response = await request(app).get(BASE_URL).set("Authorization", token);
      expect(response.status).toBe(500);
    });
  });
});
