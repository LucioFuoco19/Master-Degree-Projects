import { NetworkRepository } from "@repositories/NetworkRepository";
import { NetworkDAO } from "@dao/NetworkDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import AppError from "@models/errors/AppError";

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
      remove: mockRemove
    })
  }
}));

describe("NetworkRepository: mocked database", () => {
  const repo = new NetworkRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // === CREATION TESTS ===
  it("create network", async () => {
    mockFind.mockResolvedValue([]);
    const savedNetwork = new NetworkDAO();
    savedNetwork.code = "NET01";
    savedNetwork.name = "Network 1";
    savedNetwork.description = "Test network";
    mockSave.mockResolvedValue(savedNetwork);

    const result = await repo.createNewNetwork("NET01", "Network 1", "Test network");

    expect(result).toBeInstanceOf(NetworkDAO);
    expect(result.code).toBe("NET01");
    expect(result.name).toBe("Network 1");
    expect(result.description).toBe("Test network");
    expect(mockSave).toHaveBeenCalledWith({
      code: "NET01",
      name: "Network 1",
      description: "Test network"
    });
  });

  it("create network: conflict", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "NET01";
    mockFind.mockResolvedValue([existingNetwork]);

    await expect(
      repo.createNewNetwork("NET01", "Another", "Another desc")
    ).rejects.toThrow(ConflictError);
  });

  // === READ TESTS ===
  it("get all networks", async () => {
    const net1 = new NetworkDAO();
    net1.code = "NET01";
    net1.name = "Network 1";
    net1.description = "Test network";
    const net2 = new NetworkDAO();
    net2.code = "NET02";
    net2.name = "Network 2";
    net2.description = "Second network";
    mockFind.mockResolvedValue([net1, net2]);

    const result = await repo.getAllNetworks();
    expect(result.length).toBe(2);
    expect(result[0].code).toBe("NET01");
    expect(result[1].code).toBe("NET02");
  });

  it("get network by code", async () => {
    const foundNetwork = new NetworkDAO();
    foundNetwork.code = "NET01";
    foundNetwork.name = "Network 1";
    foundNetwork.description = "Test network";
    mockFind.mockResolvedValue([foundNetwork]);

    const result = await repo.getNetworkByCode("NET01");
    expect(result).toBe(foundNetwork);
    expect(result.code).toBe("NET01");
  });

  it("get network by code: not found", async () => {
    mockFind.mockResolvedValue([undefined]);
    await expect(repo.getNetworkByCode("NOPE")).rejects.toThrow(NotFoundError);
  });

  // === UPDATE TESTS ===
  it("update network fields", async () => {
    const foundNetwork = new NetworkDAO();
    foundNetwork.code = "NET01";
    foundNetwork.name = "Network 1";
    foundNetwork.description = "Test network";
    mockFind.mockResolvedValueOnce([foundNetwork]); // getNetworkByCode
    mockFind.mockResolvedValueOnce([]); // check newCode conflict
    mockSave.mockResolvedValue({ ...foundNetwork, code: "NEWCODE", name: "Updated Name", description: "Updated Desc" });

    await repo.updateNetwork("NET01", "NEWCODE", "Updated Name", "Updated Desc");

    expect(mockSave).toHaveBeenCalledWith({
      ...foundNetwork,
      code: "NEWCODE",
      name: "Updated Name",
      description: "Updated Desc"
    });
  });

  it("update network: conflict on new code", async () => {
    const foundNetwork = new NetworkDAO();
    foundNetwork.code = "NET01";
    foundNetwork.name = "Network 1";
    foundNetwork.description = "Test network";
    mockFind.mockResolvedValueOnce([foundNetwork]); // getNetworkByCode
    mockFind.mockResolvedValueOnce([{}]); // newCode already exists

    await expect(
      repo.updateNetwork("NET01", "NET02", "Name", "Desc")
    ).rejects.toThrow(ConflictError);
  });

  it("update network: not found", async () => {
    mockFind.mockResolvedValue([undefined]);
    await expect(
      repo.updateNetwork("NOPE", "NEWCODE", "Name", "Desc")
    ).rejects.toThrow(NotFoundError);
  });

  it("update network: invalid new code", async () => {
    const foundNetwork = new NetworkDAO();
    foundNetwork.code = "NET01";
    foundNetwork.name = "Network 1";
    foundNetwork.description = "Test network";
    mockFind.mockResolvedValue([foundNetwork]);
    await expect(
      repo.updateNetwork("NET01", "", "Name", "Desc")
    ).rejects.toThrow("Invalid new code: min length required of 1");
  });

  it("update network: only code", async () => {
  const foundNetwork = new NetworkDAO();
  foundNetwork.code = "NET01";
  foundNetwork.name = "Network 1";
  foundNetwork.description = "Test network";
  mockFind.mockResolvedValueOnce([foundNetwork]);
  mockFind.mockResolvedValueOnce([]);
  mockSave.mockResolvedValue({ ...foundNetwork, code: "NEWCODE" });

  await repo.updateNetwork("NET01", "NEWCODE", undefined, undefined);

  expect(mockSave).toHaveBeenCalledWith({
    ...foundNetwork,
    code: "NEWCODE",
    name: "Network 1",
    description: "Test network"
  });
});

it("update network: code and name", async () => {
  const foundNetwork = new NetworkDAO();
  foundNetwork.code = "NET01";
  foundNetwork.name = "Network 1";
  foundNetwork.description = "Test network";
  mockFind.mockResolvedValueOnce([foundNetwork]);
  mockFind.mockResolvedValueOnce([]);
  mockSave.mockResolvedValue({ ...foundNetwork, code: "NEWCODE", name: "Updated Name" });

  await repo.updateNetwork("NET01", "NEWCODE", "Updated Name", undefined);

  expect(mockSave).toHaveBeenCalledWith({
    ...foundNetwork,
    code: "NEWCODE",
    name: "Updated Name",
    description: "Test network"
  });
});

it("update network: code and description", async () => {
  const foundNetwork = new NetworkDAO();
  foundNetwork.code = "NET01";
  foundNetwork.name = "Network 1";
  foundNetwork.description = "Test network";
  mockFind.mockResolvedValueOnce([foundNetwork]);
  mockFind.mockResolvedValueOnce([]);
  mockSave.mockResolvedValue({ ...foundNetwork, code: "NEWCODE", description: "Updated Desc" });

  await repo.updateNetwork("NET01", "NEWCODE", undefined, "Updated Desc");

  expect(mockSave).toHaveBeenCalledWith({
    ...foundNetwork,
    code: "NEWCODE",
    name: "Network 1",
    description: "Updated Desc"
  });
});

  // === DELETE TESTS ===
  it("delete network", async () => {
    const foundNetwork = new NetworkDAO();
    foundNetwork.code = "NET01";
    foundNetwork.name = "Network 1";
    foundNetwork.description = "Test network";
    mockFind.mockResolvedValue([foundNetwork]);
    mockRemove.mockResolvedValue(undefined);

    await repo.deleteNetwork("NET01");
    expect(mockRemove).toHaveBeenCalledWith(foundNetwork);
  });

  it("delete network: not found", async () => {
    mockFind.mockResolvedValue([undefined]);
    await expect(repo.deleteNetwork("NOPE")).rejects.toThrow(NotFoundError);
  });

  // === ERROR CLASSES TESTS ===
  it("UnauthorizedError should have status 401", () => {
    const err = new UnauthorizedError("unauthorized");
    expect(err.status).toBe(401);
    expect(err.name).toBe("UnauthorizedError");
  });

  it("InsufficientRightsError should have status 403", () => {
    const err = new InsufficientRightsError("forbidden");
    expect(err.status).toBe(403);
    expect(err.name).toBe("InsufficientRightsError");
  });

  it("AppError should have custom status", () => {
    const err = new AppError("custom error", 418);
    expect(err.status).toBe(418);
    expect(err.message).toBe("custom error");
  });
});