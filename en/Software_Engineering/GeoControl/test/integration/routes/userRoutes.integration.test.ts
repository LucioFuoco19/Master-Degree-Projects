import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as userController from "@controllers/userController";
import { UserType } from "@models/UserType";
import { User as UserDTO } from "@dto/User";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@services/authService");
jest.mock("@controllers/userController");

describe("UserRoutes integration", () => {
  const BASE_URL = "/api/v1/users";
  const token = "Bearer faketoken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  // === AUTHENTICATION TESTS (401) ===
  describe("Authentication", () => {
    it("should return 401 if no Authorization header is present", async () => {
      const response = await request(app).get(BASE_URL);
      expect(response.status).toBe(401);
    });

    it("should return 401 if token format is invalid", async () => {
      const response = await request(app).get(BASE_URL).set("Authorization", "InvalidTokenFormat");
      expect(response.status).toBe(401);
    });

    it("should return 401 on UnauthorizedError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app).get(BASE_URL).set("Authorization", "Bearer invalid");
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });
  });

  // === AUTHORIZATION TESTS (403) ===
  describe("Authorization", () => {
    beforeEach(() => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });
    });

    it("should return 403 when getting users without permission", async () => {
      const response = await request(app).get(BASE_URL).set("Authorization", token);
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("should return 403 when deleting a user without permission", async () => {
      const response = await request(app).delete(`${BASE_URL}/viewer`).set("Authorization", token);
      expect(response.status).toBe(403);
    });
  });

  // === GET TESTS ===
  describe("GET requests", () => {
    it("should return all users", async () => {
      const mockUsers: UserDTO[] = [
        { username: "admin", type: UserType.Admin },
        { username: "viewer", type: UserType.Viewer }
      ];

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      const response = await request(app).get(BASE_URL).set("Authorization", token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
    });

    it("should return a specific user", async () => {
      const mockUser: UserDTO = { username: "viewer", type: UserType.Viewer };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.getUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get(`${BASE_URL}/viewer`).set("Authorization", token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });
  });

  // === POST TESTS ===
  describe("POST requests", () => {
    it("should create a new user", async () => {
      const newUser = { username: "newuser", password: "pwd12", type: UserType.Operator };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.createUser as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).post(BASE_URL).set("Authorization", token).send(newUser);
      expect(response.status).toBe(201);
    });

    it("should return 409 if user already exists", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.createUser as jest.Mock).mockImplementation(() => {
        throw new ConflictError("User already exists");
      });

      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", token)
        .send({ username: "existing", password: "pwd12", type: UserType.Viewer });
      expect(response.status).toBe(409);
    });
  });

  // === DELETE TESTS ===
  describe("DELETE requests", () => {
    it("should delete a user", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.deleteUser as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete(`${BASE_URL}/viewer`).set("Authorization", token);
      expect(response.status).toBe(204);
    });

    it("should return 404 if user not found", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.deleteUser as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("User not found");
      });

      const response = await request(app).delete(`${BASE_URL}/ghost`).set("Authorization", token);
      expect(response.status).toBe(404);
    });
  });

  // === SERVER ERROR TESTS (500) ===
  describe("Internal Server Errors", () => {
    it("should return 500 on unhandled errors", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.getAllUsers as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected failure");
      });

      const response = await request(app).get(BASE_URL).set("Authorization", token);
      expect(response.status).toBe(500);
    });
  });
});
