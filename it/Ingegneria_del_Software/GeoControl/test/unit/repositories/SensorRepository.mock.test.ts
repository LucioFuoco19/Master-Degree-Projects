import { SensorRepository } from "@repositories/SensorRepository";
import { SensorDAO } from "@dao/SensorDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: jest.fn(() => ({
      find: mockFind,
      save: mockSave,
      remove: mockRemove
    }))
  }
}));

describe("SensorRepository: mocked database", () => {
  const repo = new SensorRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create sensor successfully", async () => {
    mockFind
      .mockResolvedValueOnce([{}]) // network exists
      .mockResolvedValueOnce([{}]) // gateway exists
      .mockResolvedValueOnce([]); // no sensor with same MAC

    const savedSensor = new SensorDAO();
    savedSensor.macAddress = "00:11:22:33:44:55";
    savedSensor.name = "Temperature Sensor";
    mockSave.mockResolvedValue(savedSensor);

    const result = await repo.createSensor("NET01", "GW01", "00:11:22:33:44:55", "Temperature Sensor", "desc", "temperature", "C");

    expect(result).toBe(savedSensor);
    expect(mockSave).toHaveBeenCalled();
  });

  it("create sensor conflict", async () => {
    mockFind
      .mockResolvedValueOnce([{}]) // network exists
      .mockResolvedValueOnce([{}]) // gateway exists
      .mockResolvedValueOnce([{}]); // sensor already exists

    await expect(
      repo.createSensor("NET01", "GW01", "00:11:22:33:44:55", "Sensor", "desc", "var", "unit")
    ).rejects.toThrow(ConflictError);
  });

  it("get all sensors", async () => {
    mockFind
      .mockResolvedValueOnce([{}]) // network exists
      .mockResolvedValueOnce([{}]) // gateway exists
      .mockResolvedValueOnce([new SensorDAO(), new SensorDAO()]);

    const result = await repo.getAllSensors("NET01", "GW01");
    expect(result.length).toBe(2);
  });

  it("get sensor successfully", async () => {
    mockFind
      .mockResolvedValueOnce([{}]) // network exists
      .mockResolvedValueOnce([{}]) // gateway exists
      .mockResolvedValueOnce([new SensorDAO()]);

    const result = await repo.getSensor("NET01", "GW01", "00:11:22:33:44:55");
    expect(result).toBeInstanceOf(SensorDAO);
  });

  it("get sensor not found", async () => {
    mockFind
      .mockResolvedValueOnce([{}]) // network exists
      .mockResolvedValueOnce([{}]) // gateway exists
      .mockResolvedValueOnce([]); // sensor not found

    await expect(
      repo.getSensor("NET01", "GW01", "NOPE")
    ).rejects.toThrow(NotFoundError);
  });

  it("update sensor successfully", async () => {
    const sensor = new SensorDAO();
    sensor.macAddress = "OLD";
    sensor.name = "Old";
    sensor.description = "Old desc";
    sensor.variable = "oldVar";
    sensor.unit = "oldUnit";

    mockFind
      .mockResolvedValueOnce([{}]) // network
      .mockResolvedValueOnce([{}]) // gateway
      .mockResolvedValueOnce([sensor]) // getSensor
      .mockResolvedValueOnce([]); // check for conflict

    mockSave.mockResolvedValue(sensor);

    const result = await repo.updateSensor("NET01", "GW01", "OLD", "NEW", "NewName", "NewDesc", "newVar", "newUnit");
    expect(result.macAddress).toBe("NEW");
  });

  it("update sensor conflict on MAC", async () => {
    mockFind
      .mockResolvedValueOnce([{}]) // network
      .mockResolvedValueOnce([{}]) // gateway
      .mockResolvedValueOnce([new SensorDAO()]) // getSensor
      .mockResolvedValueOnce([{}]); // new MAC exists

    await expect(
      repo.updateSensor("NET01", "GW01", "OLD", "NEW", "", "", "", "")
    ).rejects.toThrow(ConflictError);
  });

  it("delete sensor", async () => {
    const sensor = new SensorDAO();
    sensor.macAddress = "DEL";

    mockFind
      .mockResolvedValueOnce([{}]) // network
      .mockResolvedValueOnce([{}]) // gateway
      .mockResolvedValueOnce([sensor]);

    await repo.deleteSensor("NET01", "GW01", "DEL");
    expect(mockRemove).toHaveBeenCalledWith(sensor);
  });

  it("delete sensor not found", async () => {
    mockFind
      .mockResolvedValueOnce([{}]) // network
      .mockResolvedValueOnce([{}]) // gateway
      .mockResolvedValueOnce([]); // sensor not found

    await expect(repo.deleteSensor("NET01", "GW01", "NOPE"))
      .rejects.toThrow(NotFoundError);
  });
});
