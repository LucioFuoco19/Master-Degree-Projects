import { NetworkRepository } from "@repositories/NetworkRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { NetworkDAO } from "@dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("NetworkRepository: SQLite in-memory", () => {
  const repo = new NetworkRepository();

  // === CREATION TESTS ===
  it("create network", async () => {
    const network = await repo.createNewNetwork("NET01", "Network 1", "Test network");
    expect(network).toMatchObject({
      code: "NET01",
      name: "Network 1",
      description: "Test network"
    });

    const found = await repo.getNetworkByCode("NET01");
    expect(found.code).toBe("NET01");
    expect(found.name).toBe("Network 1");
    expect(found.description).toBe("Test network");
  });

  it("create network: conflict on code", async () => {
    await repo.createNewNetwork("NET01", "Network 1", "Test network");
    await expect(
      repo.createNewNetwork("NET01", "Another", "Another desc")
    ).rejects.toThrow(ConflictError);
  });

  // === READ TESTS ===
  it("get all networks", async () => {
    await repo.createNewNetwork("NET01", "Network 1", "Test network");
    await repo.createNewNetwork("NET02", "Network 2", "Second network");
    const networks = await repo.getAllNetworks();
    expect(networks.length).toBe(2);
    const codes = networks.map(n => n.code);
    expect(codes).toContain("NET01");
    expect(codes).toContain("NET02");
  });

  it("get network by code: not found", async () => {
    await expect(repo.getNetworkByCode("NOPE")).rejects.toThrow(NotFoundError);
  });

  // === UPDATE TESTS ===
  it("update network fields", async () => {
    await repo.createNewNetwork("NET01", "Network 1", "Test network");
    await repo.updateNetwork("NET01", "NEWCODE", "Updated Name", "Updated Desc");
    const updated = await repo.getNetworkByCode("NEWCODE");
    expect(updated.code).toBe("NEWCODE");
    expect(updated.name).toBe("Updated Name");
    expect(updated.description).toBe("Updated Desc");
  });

  it("update network: conflict on new code", async () => {
    await repo.createNewNetwork("NET01", "Network 1", "Test network");
    await repo.createNewNetwork("NET02", "Network 2", "Second network");
    await expect(
      repo.updateNetwork("NET01", "NET02", "Name", "Desc")
    ).rejects.toThrow(ConflictError);
  });

  it("update network: not found", async () => {
    await expect(
      repo.updateNetwork("NOPE", "NEWCODE", "Name", "Desc")
    ).rejects.toThrow(NotFoundError);
  });

  it("update network: invalid new code", async () => {
    await repo.createNewNetwork("NET01", "Network 1", "Test network");
    await expect(
      repo.updateNetwork("NET01", "", "Name", "Desc")
    ).rejects.toThrow("Invalid new code: min length required of 1");
  });

  it("update network: only code", async () => {
    await repo.createNewNetwork("NET01", "Network 1", "Test network");
    await repo.updateNetwork("NET01", "NEWCODE", undefined, undefined);
    const updated = await repo.getNetworkByCode("NEWCODE");
    expect(updated.code).toBe("NEWCODE");
    expect(updated.name).toBe("Network 1");
    expect(updated.description).toBe("Test network");
  });

  it("update network: code and name", async () => {
    await repo.createNewNetwork("NET01", "Network 1", "Test network");
    await repo.updateNetwork("NET01", "NEWCODE", "Updated Name", undefined);
    const updated = await repo.getNetworkByCode("NEWCODE");
    expect(updated.code).toBe("NEWCODE");
    expect(updated.name).toBe("Updated Name");
    expect(updated.description).toBe("Test network");
  });

  it("update network: code and description", async () => {
    await repo.createNewNetwork("NET01", "Network 1", "Test network");
    await repo.updateNetwork("NET01", "NEWCODE", undefined, "Updated Desc");
    const updated = await repo.getNetworkByCode("NEWCODE");
    expect(updated.code).toBe("NEWCODE");
    expect(updated.name).toBe("Network 1");
    expect(updated.description).toBe("Updated Desc");
  });

  // === DELETE TESTS ===
  it("delete network", async () => {
    await repo.createNewNetwork("NET01", "Network 1", "Test network");
    await repo.deleteNetwork("NET01");
    await expect(repo.getNetworkByCode("NET01")).rejects.toThrow(NotFoundError);
  });

  it("delete network: not found", async () => {
    await expect(repo.deleteNetwork("NOPE")).rejects.toThrow(NotFoundError);
  });

  // === ERROR CLASSES IMPORT TESTS ===
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
});