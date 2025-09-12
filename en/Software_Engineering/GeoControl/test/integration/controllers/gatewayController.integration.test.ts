import * as gatewayController from "@controllers/gatewayController";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

// integration test:
// controller + repository

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
      remove: mockRemove,
    }),
  },
}));

describe("GatewayController integration ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllGateways", () => {
    it("(200)should return all gateways mapped to DTO", async () => {
      const fakeDAO: GatewayDAO = {
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "GW01",
        description: "Field node",
        network: null!,
        sensors: [],
        gatewayID: 0,
      };
      mockFind.mockResolvedValue([fakeDAO]);

      const dto = await gatewayController.getAllGateways("NET01");
      expect(mockFind).toHaveBeenCalled();
      expect(dto).toEqual([
        {
          macAddress: "AA:BB:CC:DD:EE:FF",
          name: "GW01",
          description: "Field node",
        },
      ]);
    });

    it("(200)should return all gateways with nested sensors", async () => {
      const fakeDAO: GatewayDAO = {
        macAddress: "94:3F:BE:4C:4A:79",
        name: "GW01",
        description: "on-field aggregation node",
        network: null!,
        sensors: [
          {
            sensorID: 100,
            macAddress: "71:B1:CE:01:C6:A9",
            name: "TH01",
            description: "External thermometer",
            variable: "temperature",
            unit: "C",
            gateway: null!,
            measurements: [],
          },
        ],
        gatewayID: 0,
      };
      mockFind.mockResolvedValue([fakeDAO]);

      const result = await gatewayController.getAllGateways("NET01");
      expect(mockFind).toHaveBeenCalled();
      expect(result).toEqual([
        {
          macAddress: "94:3F:BE:4C:4A:79",
          name: "GW01",
          description: "on-field aggregation node",
          sensors: [
            {
              macAddress: "71:B1:CE:01:C6:A9",
              name: "TH01",
              description: "External thermometer",
              variable: "temperature",
              unit: "C",
            },
          ],
        },
      ]);
    });

    it("(200)should return multiple gateways with sensors and measurements", async () => {
      const fakeDAO1: GatewayDAO = {
        gatewayID: 1,
        macAddress: "AA:AA:AA:AA:AA:01",
        name: "GW1",
        description: "First gateway",
        network: null!,
        sensors: [
          {
            sensorID: 10,
            macAddress: "S1:00:00:00:00:01",
            name: "Sensor1",
            description: "Temp sensor",
            variable: "temperature",
            unit: "C",
            gateway: null!,
            measurements: [],
          },
        ],
      };
      const fakeDAO2: GatewayDAO = {
        gatewayID: 2,
        macAddress: "BB:BB:BB:BB:BB:02",
        name: "GW2",
        description: "Second gateway",
        network: null!,
        sensors: [
          {
            sensorID: 20,
            macAddress: "S2:00:00:00:00:02",
            name: "Sensor2",
            description: "Humidity sensor",
            variable: "humidity",
            unit: "%",
            gateway: null!,
            measurements: [],
          },
        ],
      };
      mockFind.mockResolvedValue([fakeDAO1, fakeDAO2]);

      const result = await gatewayController.getAllGateways("NET01");
      expect(mockFind).toHaveBeenCalled();
      expect(result).toEqual([
        {
          macAddress: "AA:AA:AA:AA:AA:01",
          name: "GW1",
          description: "First gateway",
          sensors: [
            {
              macAddress: "S1:00:00:00:00:01",
              name: "Sensor1",
              description: "Temp sensor",
              variable: "temperature",
              unit: "C",
            },
          ],
        },
        {
          macAddress: "BB:BB:BB:BB:BB:02",
          name: "GW2",
          description: "Second gateway",
          sensors: [
            {
              macAddress: "S2:00:00:00:00:02",
              name: "Sensor2",
              description: "Humidity sensor",
              variable: "humidity",
              unit: "%",
            },
          ],
        },
      ]);
    });

    it("(500)should throw if repository fails", async () => {
      mockFind.mockRejectedValue(new Error("DB fail"));
      await expect(gatewayController.getAllGateways("NET01")).rejects.toThrow("DB fail");
    });

    it("(404)should throw NotFoundError if network not exists", async () => {
      mockFind.mockResolvedValue([]);
      await expect(gatewayController.getAllGateways("NO_SUCH_NET")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getGatewayByMacAddress", () => {
    it("(200)should return a single gateway DTO", async () => {
      const fakeDAO: GatewayDAO = {
        macAddress: "11:22:33:44:EE:BB",
        name: "GW02",
        description: "Edge node",
        network: null!,
        sensors: [],
        gatewayID: 0
      };
      mockFind.mockResolvedValue([fakeDAO]);

      const dto = await gatewayController.getGateway("NET01", "11:22:33:44:EE:BB");
      expect(mockFind).toHaveBeenCalled();
      expect(dto).toEqual({
        macAddress: "11:22:33:44:EE:BB",
        name: "GW02",
        description: "Edge node",
      });
    });

    it("(200)should return gateway with multiple sensors", async () => {
      const fakeDAO: GatewayDAO = {
        gatewayID: 0,
        macAddress: "CC:CC:CC:CC:CC:CC",
        name: "MultiGW",
        description: "Gateway with sensors",
        network: null!,
        sensors: [
          {
            sensorID: 1,
            macAddress: "S1:AA:AA:AA:AA:AA",
            name: "SensorA",
            description: "DescA",
            variable: "temp",
            unit: "C",
            gateway: null!,
            measurements: [],
          },
          {
            sensorID: 2,
            macAddress: "S2:BB:BB:BB:BB:BB",
            name: "SensorB",
            description: "DescB",
            variable: "hum",
            unit: "%",
            gateway: null!,
            measurements: [],
          },
        ],
      };
      mockFind.mockResolvedValue([fakeDAO]);

      const dto = await gatewayController.getGateway("NET01", "CC:CC:CC:CC:CC:CC");
      expect(mockFind).toHaveBeenCalled();
      expect(dto).toEqual({
        macAddress: "CC:CC:CC:CC:CC:CC",
        name: "MultiGW",
        description: "Gateway with sensors",
        sensors: [
          {
            macAddress: "S1:AA:AA:AA:AA:AA",
            name: "SensorA",
            description: "DescA",
            variable: "temp",
            unit: "C",
          },
          {
            macAddress: "S2:BB:BB:BB:BB:BB",
            name: "SensorB",
            description: "DescB",
            variable: "hum",
            unit: "%",
          },
        ],
      });
    });

    it("(404)should throw NotFoundError if network not exists", async () => {
      mockFind.mockResolvedValue([]);
      await expect(gatewayController.getGateway("BADNET", "ANY")).rejects.toThrow(NotFoundError);
    });

    it("(404) should throw NotFoundError if gateway not exists", async () => {
      mockFind.mockResolvedValue([]);
      await expect(gatewayController.getGateway("NET01", "BADMAC")).rejects.toThrow(NotFoundError);
    });
  });

  describe("createGateway", () => {
    const validDto = {
      macAddress: "AA:AA:AA:AA:AA:AA",
      name: "NewGW",
      description: "New gateway",
      sensors: [] as any[],
    };

    it("(201) should resolve on successful create", async () => {
      mockFind.mockResolvedValueOnce([{
        code: "NET01",
        name: "Test Network",
        description: "Test network",
        gateways: [],
      }]); // no existing gateways
      mockFind.mockResolvedValueOnce([]);
      mockSave.mockResolvedValueOnce(undefined);
      await expect(gatewayController.createGateway("NET01", validDto)).resolves.toBeUndefined();
      expect(mockSave).toHaveBeenCalled();
    });

    it("(404)should throw NotFoundError if network not exists", async () => {
      mockFind.mockResolvedValue([]);
      await expect(gatewayController.createGateway("NOTEXIST", validDto)).rejects.toThrow(NotFoundError);
    });

    it("(409)should throw ConflictError if duplicate macAddress", async () => {
      mockFind.mockResolvedValue([validDto]);
      await expect(gatewayController.createGateway("NET01", validDto)).rejects.toThrow(ConflictError);
    });

    it("(409) should throw ConflictError on duplicate create successive calls", async () => {
      mockFind.mockResolvedValueOnce([{
        code: "NET01",
        name: "Test Network",
        description: "Test network",
        gateways: [],
      }]); // no existing gateways
      mockFind.mockResolvedValueOnce([]).mockResolvedValueOnce([validDto]);
      mockSave.mockResolvedValueOnce(undefined);
      // first call: ok
      await expect(gatewayController.createGateway("NET01", validDto)).resolves.toBeUndefined();
      // second call: conflict
      await expect(gatewayController.createGateway("NET01", validDto)).rejects.toThrow(ConflictError);
    });
  });

  describe("updateGateway", () => {
    const updateDto = {
      macAddress: "BB:BB:BB:BB:BB:BB",
      name: "GW-upd",
      description: "Updated",
      sensors: [] as any[],
    };
  
    it("(200)should resolve on successful update", async () => {
      // Mock ricerca della rete (network)
      mockFind.mockResolvedValueOnce([
        { code: "NET01", name: "Test Network", description: "desc", gateways: [] }
      ]);
  
      // Mock ricerca del gateway da aggiornare (ritorna gateway esistente)
      mockFind.mockResolvedValueOnce([{
        gatewayID: 1,
        macAddress: "AA:AA:AA:AA:AA:AA",
        name: "Old GW",
        description: "Old desc",
        network: null!,  // o puoi mettere { code: "NET01" } se serve
        sensors: [],
      }]);
  
      // Mock ricerca per controllare duplicati macAddress (nessuno trovato)
      mockFind.mockResolvedValueOnce([]);
  
      // Mock salvataggio update
      mockSave.mockResolvedValue(undefined);
  
      await expect(
        gatewayController.updateGateway(
          "NET01",
          "AA:AA:AA:AA:AA:AA",
          {
            macAddress: "BB:BB:BB:BB:BB:BB",
            name: "New GW",
            description: "New desc",
          }
        )
      ).resolves.toBeUndefined();
  
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
        macAddress: "BB:BB:BB:BB:BB:BB",
        name: "New GW",
        description: "New desc",
      }));
    });
  
    it("(404)should throw NotFoundError if gateway not exists", async () => {
      mockFind.mockResolvedValue([]);
      await expect(
        gatewayController.updateGateway("NET01", "ZZ:ZZ:ZZ:ZZ:ZZ:ZZ", updateDto)
      ).rejects.toThrow(NotFoundError);
    });
  
    it("(409)should throw ConflictError on duplicate mac change", async () => {
      mockFind.mockResolvedValueOnce([
        { code: "NET01", name: "Test Network", description: "Test network", gateways: [] },
      ]); // network exists
  
      mockFind.mockResolvedValue([updateDto]); // found duplicate mac address
  
      mockSave.mockRejectedValue(new ConflictError("MAC clash"));
  
      await expect(
        gatewayController.updateGateway("NET01", "AA:AA:AA:AA:AA:AA", updateDto)
      ).rejects.toThrow(ConflictError);
    });
  });
  

  describe("deleteGateway", () => {
    it("should resolve on successful delete", async () => {
      const fakeDAO: GatewayDAO = {
        macAddress: "AA:AA:AA:AA:AA:AA",
        name: "GW",
        description: "desc",
        network: null!,
        sensors: [],
        gatewayID: 0
      };
      mockFind.mockResolvedValue([fakeDAO]);
      mockRemove.mockResolvedValue(undefined);
      await expect(
        gatewayController.deleteGateway("NET01", "AA:AA:AA:AA:AA:AA")
      ).resolves.toBeUndefined();
      expect(mockRemove).toHaveBeenCalledWith(fakeDAO);
    });

    it("should throw NotFoundError if delete misses", async () => {
      mockFind.mockResolvedValue([]);
      await expect(
        gatewayController.deleteGateway("NET01", "XX:XX:XX:XX:XX:XX")
      ).rejects.toThrow(NotFoundError);
    });
  });
});
