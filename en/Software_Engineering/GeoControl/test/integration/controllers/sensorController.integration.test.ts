import * as sensorController from "@controllers/sensorController";
import { SensorDAO } from "@models/dao/SensorDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

// integration test: controller + repository

const mockNetworkFind = jest.fn();
const mockGatewayFind = jest.fn();
const mockSensorFind = jest.fn();
const mockSensorSave = jest.fn();
const mockSensorRemove = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: (entity: any) => {
      if (entity.name === "NetworkDAO") {
        return { find: mockNetworkFind };
      }
      if (entity.name === "GatewayDAO") {
        return { find: mockGatewayFind };
      }
      if (entity.name === "SensorDAO") {
        return {
          find: mockSensorFind,
          save: mockSensorSave,
          remove: mockSensorRemove,
        };
      }
      return {};
    },
  },
}));

describe("SensorController integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllSensors", () => {
    it("(200) should return all sensors mapped to DTO", async () => {
      const fakeSensor: SensorDAO = {
        sensorID: 1,
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "S01",
        description: "Temperature sensor",
        variable: "temperature",
        unit: "C",
        gateway: {
          macAddress: "GW_MAC",
          network: { code: "NET01" } as NetworkDAO,
          gatewayID: 0,
          name: "",
          description: "",
          sensors: [],
        },
        measurements: [],
      };

      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]);
      mockGatewayFind.mockResolvedValue([
        {
          macAddress: "GW_MAC",
          network: { code: "NET01" },
          gatewayID: 0,
          name: "",
          description: "",
          sensors: [],
        },
      ]);
      mockSensorFind.mockResolvedValue([fakeSensor]);

      const dto = await sensorController.getAllSensors("NET01", "GW_MAC");
      expect(mockNetworkFind).toHaveBeenCalled();
      expect(mockGatewayFind).toHaveBeenCalled();
      expect(mockSensorFind).toHaveBeenCalled();
      expect(dto).toEqual([
        {
          macAddress: "AA:BB:CC:DD:EE:FF",
          name: "S01",
          description: "Temperature sensor",
          variable: "temperature",
          unit: "C",
        },
      ]);
    });

    it("(404) should throw NotFoundError if network does not exist", async () => {
      mockNetworkFind.mockResolvedValue([]);
      await expect(sensorController.getAllSensors("NO_NET", "GW_MAC")).rejects.toThrow(NotFoundError);
    });

    it("should return an empty list if no sensors found", async () => {
      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]);
      mockGatewayFind.mockResolvedValue([
        { macAddress: "GW_MAC", network: { code: "NET01" } },
      ]);
      mockSensorFind.mockResolvedValue([]);
    });

    it("(500) should throw if repository fails", async () => {
      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]);
      mockGatewayFind.mockResolvedValue([
        { macAddress: "GW_MAC", network: { code: "NET01" } },
      ]);
      mockSensorFind.mockRejectedValue(new Error("DB fail"));
      await expect(sensorController.getAllSensors("NET01", "GW_MAC")).rejects.toThrow("DB fail");
    });
  });

  describe("getSensorByMacAddress", () => {
    it("(200) should return single sensor DTO", async () => {
      const fakeSensor: SensorDAO = {
        sensorID: 1,
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "S01",
        description: "Temp sensor",
        variable: "temperature",
        unit: "C",
        gateway: null!,
        measurements: [],
      };
      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]);
      mockSensorFind.mockResolvedValue([fakeSensor]);

      const dto = await sensorController.getSensor("NET01", "GW_MAC", "AA:BB:CC:DD:EE:FF");
      expect(mockNetworkFind).toHaveBeenCalled();
      expect(mockSensorFind).toHaveBeenCalled();
      expect(dto).toEqual({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "S01",
        description: "Temp sensor",
        variable: "temperature",
        unit: "C",
      });
    });

    it("(404) should throw NotFoundError if network not found", async () => {
      mockNetworkFind.mockResolvedValue([]);
      await expect(sensorController.getSensor("BAD_NET", "GW_MAC", "ANY")).rejects.toThrow(NotFoundError);
    });

    it("(404) should throw NotFoundError if sensor not found", async () => {
      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]);
      mockSensorFind.mockResolvedValue([]);
      await expect(sensorController.getSensor("NET01", "GW_MAC", "BAD_MAC")).rejects.toThrow(NotFoundError);
    });
  });

  describe("createSensor", () => {
    const validDto = {
      macAddress: "AA:AA:AA:AA:AA:AA",
      name: "NewSensor",
      description: "New sensor",
      variable: "temperature",
      unit: "C",
    };

    it("(201) should resolve on successful create", async () => {
      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]); // network exists
      mockSensorFind.mockResolvedValue([]); // no duplicate sensor mac
      mockSensorSave.mockResolvedValue(undefined);

      await expect(sensorController.createSensor("NET01", "GW_MAC", validDto)).resolves.toBeUndefined();
      expect(mockSensorSave).toHaveBeenCalled();
    });

    it("(404) should throw NotFoundError if network not exists", async () => {
      mockNetworkFind.mockResolvedValue([]);
      await expect(sensorController.createSensor("NOT_EXIST", "GW_MAC", validDto)).rejects.toThrow(NotFoundError);
    });

    it("(409) should throw ConflictError if sensor mac duplicate", async () => {
      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]);
      mockSensorFind.mockResolvedValue([validDto as any]);
      await expect(sensorController.createSensor("NET01", "GW_MAC", validDto)).rejects.toThrow(ConflictError);
    });
  });

  describe("updateSensor", () => {
    const updateDto = {
      macAddress: "BB:BB:BB:BB:BB:BB",
      name: "UpdatedSensor",
      description: "Updated description",
      variable: "humidity",
      unit: "%",
    };

    it("(200) should resolve on successful update", async () => {
      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]);
      mockSensorFind
        .mockResolvedValueOnce([{ // find sensor to update
          sensorID: 1,
          macAddress: "AA:AA:AA:AA:AA:AA",
          name: "Old Sensor",
          description: "Old desc",
          variable: "temperature",
          unit: "C",
          gateway: null!,
          measurements: [],
        }])
        .mockResolvedValueOnce([]); // no duplicate mac conflict
      mockSensorSave.mockResolvedValue(undefined);

      await expect(sensorController.updateSensor("NET01", "GW_MAC", "AA:AA:AA:AA:AA:AA", updateDto)).resolves.toBeUndefined();

      expect(mockSensorSave).toHaveBeenCalledWith(expect.objectContaining({
        macAddress: "BB:BB:BB:BB:BB:BB",
        name: "UpdatedSensor",
        description: "Updated description",
        variable: "humidity",
        unit: "%",
      }));
    });

    it("(404) should throw NotFoundError if sensor not found", async () => {
      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]);
      mockSensorFind.mockResolvedValue([]);
      await expect(sensorController.updateSensor("NET01", "GW_MAC", "NON_EXISTENT", updateDto)).rejects.toThrow(NotFoundError);
    });

    it("(409) should throw ConflictError on duplicate mac address change", async () => {
      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]);
      mockSensorFind.mockResolvedValue([updateDto as any]);
      mockSensorSave.mockRejectedValue(new ConflictError("MAC conflict"));

      await expect(sensorController.updateSensor("NET01", "GW_MAC", "AA:AA:AA:AA:AA:AA", updateDto)).rejects.toThrow(ConflictError);
    });
  });

  describe("deleteSensor", () => {
    it("(200) should resolve on successful delete", async () => {
      const fakeSensor: SensorDAO = {
        sensorID: 1,
        macAddress: "AA:AA:AA:AA:AA:AA",
        name: "SensorToDelete",
        description: "Desc",
        variable: "temperature",
        unit: "C",
        gateway: null!,
        measurements: [],
      };
      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]);
      mockSensorFind.mockResolvedValue([fakeSensor]);
      mockSensorRemove.mockResolvedValue(undefined);

      await expect(sensorController.deleteSensor("NET01", "GW_MAC", "AA:AA:AA:AA:AA:AA")).resolves.toBeUndefined();
      expect(mockSensorRemove).toHaveBeenCalledWith(fakeSensor);
    });

    it("(404) should throw NotFoundError if network not found", async () => {
      mockNetworkFind.mockResolvedValue([]);
      await expect(sensorController.deleteSensor("BAD_NET", "GW_MAC", "ANY")).rejects.toThrow(NotFoundError);
    });

    it("(404) should throw NotFoundError if sensor not found", async () => {
      mockNetworkFind.mockResolvedValue([{ code: "NET01" }]);
      mockSensorFind.mockResolvedValue([]);
      await expect(sensorController.deleteSensor("NET01", "GW_MAC", "NON_EXISTENT")).rejects.toThrow(NotFoundError);
    });
  });
});
