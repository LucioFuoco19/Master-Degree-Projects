import { authenticateUser, AuthenticatedRequest } from "@middlewares/authMiddleware"; 
import { processToken } from "@services/authService";
import { UserType } from "@models/UserType";

jest.mock("@services/authService");

describe("authenticateUser middleware", () => {
  const mockReq = {
    headers: {
      authorization: "Bearer valid.token"
    }
  } as AuthenticatedRequest;

  const mockRes = {} as any;
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call processToken with authorization header and allowedRoles", async () => {
    (processToken as jest.Mock).mockResolvedValue(undefined);

    const middleware = authenticateUser([UserType.Admin, UserType.Operator]);
    await middleware(mockReq, mockRes, mockNext);

    expect(processToken).toHaveBeenCalledWith("Bearer valid.token", [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(mockNext).toHaveBeenCalledWith(); // next() called without error
  });

  it("should call next with error if processToken throws", async () => {
    const error = new Error("Invalid token");
    (processToken as jest.Mock).mockRejectedValue(error);

    const middleware = authenticateUser();
    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
