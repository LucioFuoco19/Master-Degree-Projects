import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as measurementController from "@controllers/measurementController";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { AppError } from "@models/errors/AppError";

jest.mock("@services/authService");
jest.mock("@controllers/measurementController");

describe("MeasurementsRoutes integration", () => {
  const BASE_URL = "/api/v1/networks/NET01";
  const SENSOR_PATH = "/gateways/94:3F:BE:4C:4A:79/sensors/71:B1:CE:01:C6:A9";
  const token = "Bearer faketoken";
  const validMeasurement = [
    { createdAt: "2025-02-18T17:00:00+01:00", value: 1.8567 }
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  // === AUTHENTICATION TESTS (401) ===
  describe("Authentication", () => {
    it("should return 401 if no Authorization header is present", async () => {
      const response = await request(app).get(`${BASE_URL}/measurements`);
      expect(response.status).toBe(401);
    });

    it("should return 401 if token format is invalid", async () => {
      const response = await request(app).get(`${BASE_URL}/measurements`).set("Authorization", "InvalidTokenFormat");
      expect(response.status).toBe(401);
    });

    it("should return 401 on UnauthorizedError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app).get(`${BASE_URL}/measurements`).set("Authorization", "Bearer invalid");
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

    it("should return 403 when creating a measurement without permission", async () => {
      const response = await request(app)
        .post(`${BASE_URL}${SENSOR_PATH}/measurements`)
        .set("Authorization", token)
        .send(validMeasurement);
      expect(response.status).toBe(403);
    });
  });

  // === GET NETWORK MEASUREMENTS TESTS ===
  describe("GET network measurements", () => {
    beforeEach(() => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    });

    it("should return measurements for a network", async () => {
      const mockList = [
        {
          sensorMacAddress: "71:B1:CE:01:C6:A9",
          measurements: [{ createdAt: "2025-02-18T16:00:00Z", value: 21.85 }]
        }
      ];
      (measurementController.getSensorsNetworkMeasurements as jest.Mock).mockResolvedValue(mockList);

      const response = await request(app)
        .get(`${BASE_URL}/measurements?sensorMacs[]=71:B1:CE:01:C6:A9`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockList);
    });

    it("should handle empty sensorMacs (all sensors)", async () => {
      (measurementController.getSensorsNetworkMeasurements as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get(`${BASE_URL}/measurements`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return 404 if network not found", async () => {
      (measurementController.getSensorsNetworkMeasurements as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Entity not found");
      });

      const response = await request(app)
        .get(`${BASE_URL}/measurements`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
    });

    it("should return 400 if startDate is invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/measurements?startDate=invalid-date`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
        message: expect.stringMatching(/startDate/)
      });
    });

    it("should return 400 if endDate is invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/measurements?endDate=not-a-date`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
        message: expect.stringMatching(/endDate/)
      });
    });

    it("should return 400 if both startDate and endDate are invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/measurements?startDate=bad&endDate=bad`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
      });
    });
  });

  // === GET NETWORK STATS TESTS ===
  describe("GET network stats", () => {
    beforeEach(() => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    });

    it("should return stats for a network", async () => {
      const mockStatsList = [
        {
          sensorMacAddress: "71:B1:CE:01:C6:A9",
          stats: {
            mean: 10,
            variance: 2,
            upperThreshold: 14,
            lowerThreshold: 6,
            startDate: "2025-02-18T15:00:00Z",
            endDate: "2025-02-18T17:00:00Z"
          }
        }
      ];
      (measurementController.getSensorsNetworkStats as jest.Mock).mockResolvedValue(mockStatsList);

      const response = await request(app)
        .get(`${BASE_URL}/stats?sensorMacs[]=71:B1:CE:01:C6:A9`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStatsList);
    });

    it("should return 404 if network not found", async () => {
      (measurementController.getSensorsNetworkStats as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Entity not found");
      });

      const response = await request(app)
        .get(`${BASE_URL}/stats`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
    });

    it("should return 400 if startDate is invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/stats?startDate=invalid-date`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
        message: expect.stringMatching(/startDate/)
      });
    });

    it("should return 400 if endDate is invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/stats?endDate=not-a-date`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
        message: expect.stringMatching(/endDate/)
      });
    });

    it("should return 400 if both startDate and endDate are invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/stats?startDate=bad&endDate=bad`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
      });
    });
  });

  // === GET NETWORK OUTLIERS TESTS ===
  describe("GET network outliers", () => {
    beforeEach(() => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    });

    it("should return outlier measurements for a network", async () => {
      const mockOutliersList = [
        {
          sensorMacAddress: "71:B1:CE:01:C6:A9",
          measurements: [{ createdAt: "2025-02-18T16:00:00Z", value: 99, isOutlier: true }]
        }
      ];
      (measurementController.getSensorsNetworkOutliers as jest.Mock).mockResolvedValue(mockOutliersList);

      const response = await request(app)
        .get(`${BASE_URL}/outliers?sensorMacs[]=71:B1:CE:01:C6:A9`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOutliersList);
    });

    it("should return 404 if network not found", async () => {
      (measurementController.getSensorsNetworkOutliers as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Entity not found");
      });

      const response = await request(app)
        .get(`${BASE_URL}/outliers`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
    });

    it("should return 400 if startDate is invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/outliers?startDate=invalid-date`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
        message: expect.stringMatching(/startDate/)
      });
    });

    it("should return 400 if endDate is invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/outliers?endDate=invalid-date`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
        message: expect.stringMatching(/endDate/)
      });
    });

    it("should return 400 if both startDate and endDate are invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/outliers?startDate=bad&endDate=bad`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
      });
    });
  });

  // === POST TESTS ===
  describe("POST requests", () => {
    beforeEach(() => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    });

    it("should create a new measurement", async () => {
      (measurementController.createMeasurement as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`${BASE_URL}${SENSOR_PATH}/measurements`)
        .set("Authorization", token)
        .send(validMeasurement);

      expect(response.status).toBe(201);
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post(`${BASE_URL}${SENSOR_PATH}/measurements`)
        .set("Authorization", token)
        .send([{}]);
      expect(response.status).toBe(400);
    });

    it("should return 400 if content-type is invalid", async () => {
      const response = await request(app)
        .post(`${BASE_URL}${SENSOR_PATH}/measurements`)
        .set("Authorization", token)
        .set("Content-Type", "application/json")
        .send("invalid data");
      expect(response.status).toBe(400);
    });

    it("should return 404 if network/gateway/sensor not found", async () => {
      (measurementController.createMeasurement as jest.Mock).mockRejectedValue(new NotFoundError("Entity not found"));

      const response = await request(app)
        .post(`${BASE_URL}${SENSOR_PATH}/measurements`)
        .set("Authorization", token)
        .send(validMeasurement);

      expect(response.status).toBe(404);
    });

    /** Non è un problema ricevere misure duplicate. */
    // it("should return 409 if measurement already exists (conflict)", async () => {
    //   (measurementController.createMeasurement as jest.Mock).mockRejectedValue(new ConflictError("Measurement already exists"));

    //   const response = await request(app)
    //     .post(`${BASE_URL}${SENSOR_PATH}/measurements`)
    //     .set("Authorization", token)
    //     .send(validMeasurement);

    //   expect(response.status).toBe(409);
    // });
  });

  // === GET SENSOR MEASUREMENTS TESTS ===
  describe("GET sensor measurements", () => {
    beforeEach(() => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    });

    it("should return measurements for a sensor", async () => {
      const mockMeasurements = {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        measurements: [{ createdAt: "2025-02-18T16:00:00Z", value: 21.85 }]
      };
      (measurementController.getSensorMeasurements as jest.Mock).mockResolvedValue(mockMeasurements);

      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/measurements`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMeasurements);
    });

    it("should return 404 if sensor not found", async () => {
      (measurementController.getSensorMeasurements as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Entity not found");
      });

      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/measurements`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
    });

    it("should return 400 if startDate is invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/measurements?startDate=invalid-date`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
    });
  });

  // === GET SENSOR STATS TESTS ===
  describe("GET sensor stats", () => {
    beforeEach(() => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    });

    it("should return stats for a sensor", async () => {
      const mockStats = {
        mean: 10,
        variance: 2,
        upperThreshold: 14,
        lowerThreshold: 6,
        startDate: "2025-02-18T15:00:00Z",
        endDate: "2025-02-18T17:00:00Z"
      };
      (measurementController.getSensorStats as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/stats`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
    });

    it("should return 400 if startDate is invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/stats?startDate=invalid-date`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/), // Accept either "Bad Request" or "BadRequest"
        message: expect.stringMatching(/startDate/)
      });
    });

    it("should return 400 if endDate is invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/stats?endDate=not-a-date`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/), // Accept either "Bad Request" or "BadRequest"
        message: expect.stringMatching(/endDate/)
      });
    });

    it("should return 400 if both startDate and endDate are invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/stats?startDate=bad&endDate=bad`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/), // Accept either "Bad Request" or "BadRequest"
      });
    });

    it("should return 404 if sensor not found", async () => {
      (measurementController.getSensorStats as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Entity not found");
      });

      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/stats`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
    });
  });

  // === GET SENSOR OUTLIERS TESTS ===
  describe("GET sensor outliers", () => {
    beforeEach(() => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    });

    it("should return outlier measurements for a sensor", async () => {
      const mockOutliers = {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        measurements: [{ createdAt: "2025-02-18T16:00:00Z", value: 99, isOutlier: true }]
      };
      (measurementController.getSensorOutliers as jest.Mock).mockResolvedValue(mockOutliers);

      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/outliers`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOutliers);
    });

    it("should return 400 if startDate is invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/outliers?startDate=invalid-date`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
        message: expect.stringMatching(/startDate/)
      });
    });

    it("should return 400 if endDate is invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/outliers?endDate=invalid-date`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
        message: expect.stringMatching(/endDate/)
      });
    });

    it("should return 400 if both startDate and endDate are invalid", async () => {
      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/outliers?startDate=bad&endDate=bad`)
        .set("Authorization", token);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 400,
        name: expect.stringMatching(/^Bad ?Request$/),
      });
    });

    it("should return 404 if sensor not found", async () => {
      (measurementController.getSensorOutliers as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Entity not found");
      });

      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/outliers`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
    });
  });

  // === ERROR PROPAGATION TESTS ===
  describe("Error propagation", () => {
    beforeEach(() => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    });

    it("should return 500 on generic AppError", async () => {
      (measurementController.getSensorMeasurements as jest.Mock).mockImplementation(() => {
        throw new AppError("Generic error", 500);
      });

      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/measurements`)
        .set("Authorization", token);

      expect(response.status).toBe(500);
    });
  });

  // === DOMAIN EDGE CASES TESTS ===
  describe("Domain edge cases", () => {
    beforeEach(() => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    });

    it("should handle empty measurements array", async () => {
      (measurementController.getSensorMeasurements as jest.Mock).mockResolvedValue({
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        measurements: []
      });

      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/measurements`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body.measurements).toEqual([]);
    });

    it("should handle missing startDate/endDate (no filter)", async () => {
      (measurementController.getSensorStats as jest.Mock).mockResolvedValue({
        mean: 0, variance: 0, upperThreshold: 0, lowerThreshold: 0
      });

      const response = await request(app)
        .get(`${BASE_URL}${SENSOR_PATH}/stats`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("mean");
    });
  });
});