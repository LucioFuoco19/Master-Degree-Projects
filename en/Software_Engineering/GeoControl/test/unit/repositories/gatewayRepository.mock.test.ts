import { GatewayRepository } from "@repositories/GatewayRepository";
import { GatewayDAO } from "@dao/GatewayDAO";
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

describe("GatewayRepository: mocked database", () => {
  const repo = new GatewayRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create gateway successfully", async () => {
    mockFind
      .mockResolvedValueOnce([{}]) // network exists
      .mockResolvedValueOnce([]);  // no gateway with same MAC

    const savedGateway = new GatewayDAO();
    savedGateway.macAddress = "AA:BB:CC:DD:EE:FF";
    savedGateway.name = "Gateway 1";
    savedGateway.description = "Main gateway";
    mockSave.mockResolvedValue(savedGateway);

    const result = await repo.createGateway("NET01", "AA:BB:CC:DD:EE:FF", "Gateway 1", "Main gateway");

    expect(result).toBe(savedGateway);
    expect(mockSave).toHaveBeenCalled();
  });

  it("create gateway conflict", async () => {
    mockFind
      .mockResolvedValueOnce([{}])  // network exists
      .mockResolvedValueOnce([{}]); // gateway with MAC exists

    await expect(
      repo.createGateway("NET01", "AA:BB:CC:DD:EE:FF", "GW", "desc")
    ).rejects.toThrow(ConflictError);
  });

  it("create gateway network not found", async () => {
    mockFind.mockResolvedValueOnce([]); // network not found

    await expect(
      repo.createGateway("NET01", "AA:BB:CC:DD:EE:FF", "GW", "desc")
    ).rejects.toThrow(NotFoundError);
  });

  it("get all gateways", async () => {
    mockFind.mockResolvedValueOnce([{}]); // network exists
    mockFind.mockResolvedValueOnce([
      new GatewayDAO(),
      new GatewayDAO(),
    ]);

    const result = await repo.getAllGateways("NET01");
    expect(result.length).toBe(2);
  });

  it("get gateway successfully", async () => {
    mockFind.mockResolvedValueOnce([{}]); // network exists
    mockFind.mockResolvedValueOnce([new GatewayDAO()]); // gateway found

    const result = await repo.getGateway("NET01", "AA:BB:CC:DD:EE:FF");
    expect(result).toBeInstanceOf(GatewayDAO);
  });

  it("get gateway not found", async () => {
    mockFind.mockResolvedValueOnce([{}]); // network exists
    mockFind.mockResolvedValueOnce([]);   // gateway not found

    await expect(
      repo.getGateway("NET01", "NOPE")
    ).rejects.toThrow(NotFoundError);
  });

  it("update gateway successfully", async () => {
    const gateway = new GatewayDAO();
    gateway.macAddress = "OLD:MAC";
    gateway.name = "OldName";
    gateway.description = "OldDesc";

    mockFind
      .mockResolvedValueOnce([{}])  // network exists (from getGateway)
      .mockResolvedValueOnce([gateway])  // getGateway returns gateway
      .mockResolvedValueOnce([]);  // no conflict with new MAC

    mockSave.mockResolvedValue(gateway);

    await repo.updateGateway("NET01", "OLD:MAC", "NEW:MAC", "NewName", "NewDesc");

    expect(gateway.macAddress).toBe("NEW:MAC");
    expect(gateway.name).toBe("NewName");
    expect(gateway.description).toBe("NewDesc");
    expect(mockSave).toHaveBeenCalledWith(gateway);
  });

  it("update gateway conflict on MAC", async () => {
    mockFind
      .mockResolvedValueOnce([{}])   // network exists (from getGateway)
      .mockResolvedValueOnce([new GatewayDAO()]) // getGateway returns gateway
      .mockResolvedValueOnce([{}]);  // conflict on new MAC

    await expect(
      repo.updateGateway("NET01", "OLD:MAC", "NEW:MAC", "", "")
    ).rejects.toThrow(ConflictError);
  });

  it("delete gateway successfully", async () => {
    const gateway = new GatewayDAO();
    gateway.macAddress = "DEL:MAC";

    mockFind
      .mockResolvedValueOnce([{}])   // network exists (from getGateway)
      .mockResolvedValueOnce([gateway]); // getGateway returns gateway

    await repo.deleteGateway("NET01", "DEL:MAC");

    expect(mockRemove).toHaveBeenCalledWith(gateway);
  });

  it("delete gateway not found", async () => {
    mockFind
      .mockResolvedValueOnce([{}])   // network exists (from getGateway)
      .mockResolvedValueOnce([]);    // gateway not found

    await expect(
      repo.deleteGateway("NET01", "NOPE")
    ).rejects.toThrow(NotFoundError);
  });
});