import * as userController from "@controllers/userController";
import { UserDAO } from "@models/dao/UserDAO";
import { UserType } from "@models/UserType";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

// Mock repository methods
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

describe("UserController integration", () => {
  const fakeUserDAO: UserDAO = {
    username: "testuser",
    password: "secret",
    type: UserType.Operator,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("(200) should return all users mapped to DTO", async () => {
      const users: UserDAO[] = [
        { username: "admin", password: "adminpass", type: UserType.Admin },
        { username: "viewer", password: "viewerpass", type: UserType.Viewer },
      ];
      mockFind.mockResolvedValue(users);

      const result = await userController.getAllUsers();

      expect(mockFind).toHaveBeenCalled();
      expect(result).toEqual([
        { username: "admin", type: UserType.Admin },
        { username: "viewer", type: UserType.Viewer },
      ]);
    });

    it("(500) should throw if repository fails", async () => {
      mockFind.mockRejectedValue(new Error("DB fail"));
      await expect(userController.getAllUsers()).rejects.toThrow("DB fail");
    });

    it("should return an empty list if no users found", async () => {
      mockFind.mockResolvedValue([]);
      await expect(userController.getAllUsers()).resolves.toEqual([]);
    });
  });

  describe("getUser", () => {
    it("(200) should return a single user DTO", async () => {
      mockFind.mockResolvedValue([fakeUserDAO]);

      const result = await userController.getUser("testuser");

      expect(mockFind).toHaveBeenCalled();
      expect(result).toEqual({ username: "testuser", type: UserType.Operator });
    });

    it("(404) should throw NotFoundError if user not exists", async () => {
      mockFind.mockResolvedValue([]);
      await expect(userController.getUser("notfound")).rejects.toThrow(NotFoundError);
    });
  });

  describe("createUser", () => {
    const newUser = {
      username: "newuser",
      password: "newpass",
      type: UserType.Viewer,
    };

    it("(201) should resolve on successful create", async () => {
      mockFind.mockResolvedValueOnce([]); // no existing user
      mockSave.mockResolvedValueOnce(undefined);

      await expect(userController.createUser(newUser)).resolves.toBeUndefined();
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining(newUser));
    });

    it("(409) should throw ConflictError if username already exists", async () => {
      mockFind.mockResolvedValueOnce([fakeUserDAO]);

      await expect(userController.createUser(newUser)).rejects.toThrow(ConflictError);
    });
  });

  describe("deleteUser", () => {
    it("(200) should resolve on successful delete", async () => {
      mockFind.mockResolvedValueOnce([fakeUserDAO]);
      mockRemove.mockResolvedValueOnce(undefined);

      await expect(userController.deleteUser("testuser")).resolves.toBeUndefined();
      expect(mockRemove).toHaveBeenCalledWith(fakeUserDAO);
    });

    it("(404) should throw NotFoundError if user not found", async () => {
      mockFind.mockResolvedValueOnce([]);
      await expect(userController.deleteUser("ghost")).rejects.toThrow(NotFoundError);
    });
  });
});
