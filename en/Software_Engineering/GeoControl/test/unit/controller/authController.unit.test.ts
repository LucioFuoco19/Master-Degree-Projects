import { getToken } from "@controllers/authController";
import { UserRepository } from "@repositories/UserRepository";
import { UnauthorizedError } from "@errors/UnauthorizedError";
import { UserType } from "@models/UserType";
import * as authService from "@services/authService";
import * as mapperService from "@services/mapperService";

// Mocks
jest.mock("@repositories/UserRepository");
jest.mock("@services/authService");
jest.mock("@services/mapperService");

describe("getToken", () => {
  const username = "testuser";
  const password = "secret";
  const type = UserType.Operator;

  const userDto = { username, password };
  const userDao = { username, password, type };

  const fakeJWT = "jwt.token.value";
  const expectedTokenDTO = { token: fakeJWT };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a token DTO when credentials are correct", async () => {
    // Mock repository and services
    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue(userDao)
    }));

    const userDTO = { username, password, type };
    (mapperService.createUserDTO as jest.Mock).mockReturnValue(userDTO);
    (authService.generateToken as jest.Mock).mockReturnValue(fakeJWT);
    (mapperService.createTokenDTO as jest.Mock).mockReturnValue(expectedTokenDTO);

    const result = await getToken(userDto);

    expect(result).toEqual(expectedTokenDTO);
    expect(UserRepository).toHaveBeenCalled();
    expect(mapperService.createUserDTO).toHaveBeenCalledWith(username, type, password);
    expect(authService.generateToken).toHaveBeenCalledWith(userDTO);
    expect(mapperService.createTokenDTO).toHaveBeenCalledWith(fakeJWT);
  });

  it("should throw UnauthorizedError if password is incorrect", async () => {
    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue({ ...userDao, password: "wrongpass" })
    }));

    await expect(getToken(userDto)).rejects.toThrow(UnauthorizedError);
  });

  it("should propagate any other error", async () => {
    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockRejectedValue(new Error("DB failure"))
    }));

    await expect(getToken(userDto)).rejects.toThrow("DB failure");
  });
});
