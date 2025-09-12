// authenticateRoutes.integration.test.ts

import request from "supertest";
import express, { Express } from "express";
import authRoutes from "@routes/authenticationRoutes";
import { getToken } from "@controllers/authController";

// Mock del controller
jest.mock("@controllers/authController", () => ({
  getToken: jest.fn(),
}));

const mockUser = { username: "testuser", password: "testpassword" };
const mockToken = "mock.jwt.token";

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/api/v1/auth", authRoutes);
});

describe("POST /api/v1/auth", () => {
  it("should return a token when credentials are valid", async () => {
    (getToken as jest.Mock).mockResolvedValueOnce(mockToken);

    const res = await request(app)
      .post("/api/v1/auth")
      .send(mockUser);

    expect(res.status).toBe(200);
    expect(res.body).toBe(mockToken);
    expect(getToken).toHaveBeenCalledWith(expect.objectContaining(mockUser));
  });

  it("should handle invalid credentials or input", async () => {
    (getToken as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Invalid credentials");
    });

    const res = await request(app)
      .post("/api/v1/auth")
      .send({ email: "bad", password: "" });

    expect(res.status).toBe(500); // oppure 401/400, a seconda di come gestisci gli errori nel controller
  });

  it("should call next(error) if getToken throws", async () => {
    const err = new Error("Something went wrong");
    (getToken as jest.Mock).mockRejectedValueOnce(err);

    const res = await request(app)
      .post("/api/v1/auth")
      .send(mockUser);

    expect(res.status).toBe(500);
  });
});
