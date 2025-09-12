import jwt from "jsonwebtoken";
import * as authService from "@services/authService";
import { User as UserDTO } from "@dto/User";
import { UserRepository } from "@repositories/UserRepository";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { UserType } from "@models/UserType";

jest.mock("@repositories/UserRepository");
jest.mock("jsonwebtoken");

const mockUser: UserDTO = {
  username: "john",
  type: UserType.Admin
};

const token = "signed.jwt.token";

// === generateToken ===
describe("generateToken", () => {
  it("should sign and return a JWT token", () => {
    (jwt.sign as jest.Mock).mockReturnValue(token);

    const result = authService.generateToken(mockUser);

    expect(jwt.sign).toHaveBeenCalledWith(mockUser, expect.any(String), expect.any(Object));
    expect(result).toBe(token);
  });
});

// === processToken ===
describe("processToken", () => {
  const validToken = "Bearer " + token;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow user with valid token and role", async () => {
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);

    const mockGetUser = jest.fn().mockResolvedValue({ username: "john", type: UserType.Admin });
    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: mockGetUser
    }));

    await expect(authService.processToken(validToken, [UserType.Admin])).resolves.toBeUndefined();
  });

  it("should throw if token is missing", async () => {
    await expect(authService.processToken(undefined)).rejects.toThrow(UnauthorizedError);
  });

  it("should throw if token format is invalid", async () => {
    await expect(authService.processToken("BadToken")).rejects.toThrow(UnauthorizedError);
  });

  it("should throw if user not found in repo", async () => {
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);
    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockRejectedValue(new Error("not found"))
    }));

    await expect(authService.processToken(validToken)).rejects.toThrow(UnauthorizedError);
  });

  it("should throw if user has insufficient rights", async () => {
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);
    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue({ username: "john", type: UserType.Viewer })
    }));

    await expect(authService.processToken(validToken, [UserType.Admin]))
      .rejects.toThrow(InsufficientRightsError);
  });

  it("should allow when no roles are specified", async () => {
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);
    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue({ username: "john", type: UserType.Admin })
    }));

    await expect(authService.processToken(validToken)).resolves.toBeUndefined();
  });
});
