import * as networkController from "@controllers/networkController";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

// mock repository methods
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

describe("NetworkController integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllNetworks", () => {
    it("(200) should return all networks mapped to DTO", async () => {
      const fakeDAO: NetworkDAO = {
        code: "NET01",
        name: "Test Network",
        description: "Test network description",
        gateways: [],
        networkID: 0
      };
      mockFind.mockResolvedValue([fakeDAO]);

      const result = await networkController.getAllNetworks();
      expect(mockFind).toHaveBeenCalled();
      expect(result).toEqual([
        {
          code: "NET01",
          name: "Test Network",
          description: "Test network description",
        },
      ]);
    });

    it("(500) should throw if repository fails", async () => {
      mockFind.mockRejectedValue(new Error("DB fail"));
      await expect(networkController.getAllNetworks()).rejects.toThrow("DB fail");
    });

    it("should return an empty list if no networks found", async () => {
      mockFind.mockResolvedValue([]);
      await expect(networkController.getAllNetworks()).resolves.toEqual([]);
    });
    
  });

  describe("getNetworkByCode", () => {
    it("(200) should return a single network DTO", async () => {
      const fakeDAO: NetworkDAO = {
        code: "NET01",
        name: "Test Network",
        description: "Test network description",
        gateways: [],
        networkID: 0
      };
      mockFind.mockResolvedValue([fakeDAO]);

      const result = await networkController.getNetworkByCode("NET01");
      expect(mockFind).toHaveBeenCalled();
      expect(result).toEqual({
        code: "NET01",
        name: "Test Network",
        description: "Test network description",
      });
    });

    it("(404) should throw NotFoundError if network not exists", async () => {
      mockFind.mockResolvedValue([]);
      await expect(networkController.getNetworkByCode("NO_NET")).rejects.toThrow(NotFoundError);
    });
  });

  describe("createNetwork", () => {
    const validDto = {
      code: "NET02",
      name: "New Network",
      description: "New network description",
    };

    it("(201) should resolve on successful create", async () => {
      mockFind.mockResolvedValueOnce([]); // no existing networks with code
      mockSave.mockResolvedValueOnce(undefined);
      await expect(networkController.createNewNetwork(validDto)).resolves.toBeUndefined();
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining(validDto));
    });

    it("(409) should throw ConflictError if network code duplicate", async () => {
      mockFind.mockResolvedValue([validDto]);
      await expect(networkController.createNewNetwork(validDto)).rejects.toThrow(ConflictError);
    });
  });

  describe("updateNetwork", () => {
    const updateDto = {
      code: "NET01",
      name: "Updated Network",
      description: "Updated description",
    };

    it("(200) should resolve on successful update", async () => {
      // mock find existing network
      mockFind.mockResolvedValueOnce([updateDto]);

      // mock save updated entity
      mockSave.mockResolvedValue(undefined);

      await expect(networkController.updateNetwork("NET01", updateDto)).resolves.toBeUndefined();

      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining(updateDto));
    });

    it("(404) should throw NotFoundError if network not exists", async () => {
      mockFind.mockResolvedValue([]);
      await expect(networkController.updateNetwork("NO_NET", updateDto)).rejects.toThrow(NotFoundError);
    });

    it("(409) should throw ConflictError on duplicate code update", async () => {
      mockFind.mockResolvedValueOnce([updateDto]); // network to update exists
      mockFind.mockResolvedValue([updateDto]); // duplicate code found
      mockSave.mockRejectedValue(new ConflictError("Code clash"));

      await expect(networkController.updateNetwork("NET01", updateDto)).rejects.toThrow(ConflictError);
    });
  });

  describe("deleteNetwork", () => {
    it("should resolve on successful delete", async () => {
      const fakeDAO: NetworkDAO = {
        code: "NET01",
        name: "Test Network",
        description: "Test description",
        gateways: [],
        networkID: 0
      };
      mockFind.mockResolvedValue([fakeDAO]);
      mockRemove.mockResolvedValue(undefined);

      await expect(networkController.deleteNetwork("NET01")).resolves.toBeUndefined();
      expect(mockRemove).toHaveBeenCalledWith(fakeDAO);
    });

    it("should throw NotFoundError if network not exists", async () => {
      mockFind.mockResolvedValue([]);
      await expect(networkController.deleteNetwork("NO_NET")).rejects.toThrow(NotFoundError);
    });
  });
});
