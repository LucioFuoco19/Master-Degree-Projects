import * as measurementController from "@controllers/measurementController";
import { NotFoundError } from "@models/errors/NotFoundError";

const mockFind = jest.fn();
const mockSave = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
    }),
  },
}));

describe("MeasurementController integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFind.mockReset();  // resettare le risposte del mock find
        mockSave.mockReset();  // resettare le risposte del mock save
      });
      

  describe("createMeasurement", () => {
    it("(201) should call repository createMeasurement successfully", async () => {
      // Mocks for validation (network, gateway, sensor)
      mockFind
        .mockResolvedValueOnce([{ code: "NET01" }]) // validateNetwork
        .mockResolvedValueOnce([{ macAddress: "GW01" }]) // validateGateway
        .mockResolvedValueOnce([{ macAddress: "SEN01", gateway: { macAddress: "GW01", network: { code: "NET01" }}}]) // validateSensor
        .mockResolvedValueOnce(undefined); // save measurement

      mockSave.mockResolvedValue(undefined);

      await expect(
        measurementController.createMeasurement(
          "NET01",
          "GW01",
          "SEN01",
          new Date(),
          42
        )
      ).resolves.toBeUndefined();

      expect(mockSave).toHaveBeenCalled();
    });

    it("(404) should throw NotFoundError if network does not exist", async () => {
      mockFind.mockResolvedValueOnce([]); // validateNetwork

      await expect(
        measurementController.createMeasurement(
          "NO_NET",
          "GW01",
          "SEN01",
          new Date(),
          42
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("(404) should throw NotFoundError if gateway does not exist", async () => {
      mockFind
        .mockResolvedValueOnce([{ code: "NET01" }]) // validateNetwork
        .mockResolvedValueOnce([]); // validateGateway

      await expect(
        measurementController.createMeasurement(
          "NET01",
          "NO_GAT",
          "SEN01",
          new Date(),
          42
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("(404) should throw NotFoundError if sensor does not exist", async () => {
      mockFind
        .mockResolvedValueOnce([{ code: "NET01" }]) // validateNetwork
        .mockResolvedValueOnce([{ macAddress: "GW01" }]) // validateGateway
        .mockResolvedValueOnce([]); // validateSensor

      await expect(
        measurementController.createMeasurement(
          "NET01",
          "GW01",
          "NO_SENS",
          new Date(),
          42
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getSensorMeasurements", () => {
    it("(200) should return measurements list for a sensor", async () => {
      // Setup mocks for validation
      mockFind
        .mockResolvedValueOnce([{ code: "NET01" }]) // validateNetwork
        .mockResolvedValueOnce([{ macAddress: "GW01" }]) // validateGateway
        .mockResolvedValueOnce([{ macAddress: "SEN01", gateway: { macAddress: "GW01", network: { code: "NET01" }}}]) // validateSensor
        .mockResolvedValueOnce([
          {
            createdAt: new Date("2025-05-30T10:00:00Z"),
            value: 50,
            sensor: {
              macAddress: "SEN01",
              gateway: { macAddress: "GW01", network: { code: "NET01" } },
            },
          },
        ]); // find measurements

      const result = await measurementController.getSensorMeasurements(
        "NET01",
        "GW01",
        "SEN01",
        "2025-05-01",
        "2025-05-31"
      );

      expect(result.sensorMacAddress).toBe("SEN01");
      expect(result.measurements).toHaveLength(1);
      expect(result.measurements[0].value).toBe(50);
    });

    it("(404) should throw NotFoundError if sensor does not exist", async () => {
      mockFind
        .mockResolvedValueOnce([{ code: "NET01" }]) // network
        .mockResolvedValueOnce([{ macAddress: "GW01" }]) // gateway
        .mockResolvedValueOnce([]); // sensor not found

      await expect(
        measurementController.getSensorMeasurements(
          "NET01",
          "GW01",
          "NO_SENSOR",
          "2025-05-01",
          "2025-05-31"
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getSensorsNetworkMeasurements", () => {
    it("(200) should return measurements list for multiple sensors", async () => {
      // Validate network
      mockFind.mockResolvedValueOnce([{ code: "NET01" }]);
      // Sensors found
      mockFind.mockResolvedValueOnce([
        { macAddress: "SEN01", gateway: { macAddress: "GW01", network: { code: "NET01" } } },
        { macAddress: "SEN02", gateway: { macAddress: "GW01", network: { code: "NET01" } } },
      ]);

      // Each sensor validations and measurements
      // For SEN01:
      mockFind.mockResolvedValueOnce([{ code: "NET01" }]); // network validate in getSensorMeasurements
      mockFind.mockResolvedValueOnce([{ macAddress: "GW01" }]); // gateway validate
      mockFind.mockResolvedValueOnce([{ macAddress: "SEN01", gateway: { macAddress: "GW01", network: { code: "NET01" } } }]); // sensor validate
      mockFind.mockResolvedValueOnce([]); // measurements for SEN01

      // For SEN02:
      mockFind.mockResolvedValueOnce([{ code: "NET01" }]);
      mockFind.mockResolvedValueOnce([{ macAddress: "GW01" }]);
      mockFind.mockResolvedValueOnce([{ macAddress: "SEN02", gateway: { macAddress: "GW01", network: { code: "NET01" } } }]);
      mockFind.mockResolvedValueOnce([]); // measurements for SEN02

      const result = await measurementController.getSensorsNetworkMeasurements("NET01", ["SEN01", "SEN02"], "2025-05-01", "2025-05-31");

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].sensorMacAddress).toBe("SEN01");
      expect(result[1].sensorMacAddress).toBe("SEN02");
    });
  });

  describe("getSensorStats", () => {
    it("(200) should return statistics for a sensor", async () => {
      mockFind
        .mockResolvedValueOnce([{ code: "NET01" }]) // network
        .mockResolvedValueOnce([{ macAddress: "GW01" }]) // gateway
        .mockResolvedValueOnce([{ macAddress: "SEN01", gateway: { macAddress: "GW01", network: { code: "NET01" } } }]) // sensor
        .mockResolvedValueOnce([
          { createdAt: new Date(), value: 10, sensor: {} },
          { createdAt: new Date(), value: 20, sensor: {} },
          { createdAt: new Date(), value: 30, sensor: {} },
        ]); // measurements

      const stats = await measurementController.getSensorStats("NET01", "GW01", "SEN01", undefined, undefined);

      expect(stats).toHaveProperty("mean");
      expect(stats).toHaveProperty("variance");
      expect(stats).toHaveProperty("startDate");
      expect(stats).toHaveProperty("endDate");
      expect(stats).toHaveProperty("upperThreshold");
      expect(stats).toHaveProperty("lowerThreshold");

    });
  });

  describe("getSensorsNetworkStats", () => {
    it("(200) should return stats for multiple sensors in network", async () => {
      mockFind.mockResolvedValueOnce([{ code: "NET01" }]); // validate network
      mockFind.mockResolvedValueOnce([
        { macAddress: "SEN01", gateway: { macAddress: "GW01", network: { code: "NET01" } } },
        { macAddress: "SEN02", gateway: { macAddress: "GW02", network: { code: "NET01" } } },
      ]); // find sensors

      // For SEN01 measurements
      mockFind.mockResolvedValueOnce([
        { createdAt: new Date(), value: 10, sensor: {} },
        { createdAt: new Date(), value: 20, sensor: {} },
      ]);
      // For SEN02 measurements
      mockFind.mockResolvedValueOnce([
        { createdAt: new Date(), value: 5, sensor: {} },
        { createdAt: new Date(), value: 15, sensor: {} },
      ]);

      const statsList = await measurementController.getSensorsNetworkStats("NET01", ["SEN01", "SEN02"], undefined, undefined);

      expect(statsList).toHaveLength(2);
      expect(statsList[0]).toHaveProperty("sensorMacAddress", "SEN01");
      expect(statsList[0]).toHaveProperty("stats");
      expect(statsList[1]).toHaveProperty("sensorMacAddress", "SEN02");
      expect(statsList[1]).toHaveProperty("stats");
    });
  });
});
