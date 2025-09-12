import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as gatewayController from "@controllers/gatewayController";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@services/authService");
jest.mock("@controllers/networkController");
jest.mock("@controllers/gatewayController");
    const mockToken = 'Bearer faketoken';
    const networkCode = 'test-network';
    const gatewayMac = '00:11:22:33:44:55';
    const updatedMac = 'AA:BB:CC:DD:EE:FF';
    const mockAdmin = { email: 'admin@example.com', role: 'Admin' };
    const mockOperator = { email: 'op@example.com', role: 'Operator' };
    const mockViewer = { email: 'viewer@example.com', role: 'Viewer' };
    const Users = [mockAdmin, mockOperator,mockOperator];
describe ("gatewayIntegration",()=>{
    const mockGateways = [
      {
        macAddress: '00:11:22:33:44:55',
        name: 'Gateway 1',
        description: 'Test gateway 1',
        sensors: []
      },
      {
        macAddress: '66:77:88:99:AA:BB',
        name: 'Gateway 2',
        description: 'Test gateway 2',
        sensors: []
      },
      {
        macAddress: '00:11:22:33:44:56',
        name: 'Gateway 3',
        description: 'A test gateway',
      },
      {
        macAddress: gatewayMac,
        name: 'Main Gateway',
        description: 'Primary entry point',
        sensors: [],
      },
      {
        macAddress: updatedMac,
        name: 'Gateway Updated',
        description: 'Updated description',
      },
    ];
    afterEach(() => {
      jest.clearAllMocks();
    });
    describe("Get All Gateways", ()=>{
      it.each(Users)('should return 200 and a list of gateways if authenticated for every role', async ({role}) => {  
          (authService.processToken as jest.Mock).mockResolvedValue(role);
            (gatewayController.getAllGateways as jest.Mock).mockResolvedValue(mockGateways);
          const res = await request(app).get(`/api/v1/networks/${networkCode}/gateways`).set('Authorization', mockToken);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockGateways);
            expect(gatewayController.getAllGateways).toHaveBeenCalledWith(networkCode);
      });
      it('should return 401 if not authenticated', async () => {
          (authService.processToken as jest.Mock).mockImplementation(() => {
              throw new UnauthorizedError("Unauthorized: No token provided");
          });
          const res = await request(app).get(`/api/v1/networks/${networkCode}/gateways`);
          expect(res.status).toBe(401);
          expect(res.body.message).toBeDefined(); 
          });
      it('should return 404 if network not found', async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(mockAdmin);
        (gatewayController.getAllGateways as jest.Mock).mockImplementation(() => {
          throw new NotFoundError("Network not found");
        });
        const res = await request(app).get(`/api/v1/networks/${networkCode}/gateways`).set("Authorization", mockToken);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Network not found");
      });
    });
  describe("Create a new Gateway",()=>{
    it.each([['Admin', mockAdmin],['Operator', mockOperator],])('should create a new gateway', async (_, role) => {
        (authService.processToken as jest.Mock).mockResolvedValue(role);
        const res = await request(app).post(`/api/v1/networks/${networkCode}/gateways`).set('Authorization', 'Bearer valid-token').send(mockGateways[2]);
        expect(res.status).toBe(201);
    });    
    it.each([['Admin', mockAdmin],['Operator', mockOperator],])('should return 400 if input data is invalid', async (_, role) => {
         (authService.processToken as jest.Mock).mockResolvedValue(role);
        const res = await request(app).post(`/api/v1/networks/${networkCode}/gateways`).set('Authorization', 'Bearer valid-token').send({ name: 'Missing MAC address' });
        expect(res.status).toBe(400);
    });
    it('should return 401 if no auth token is provided', async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });
      const res = await request(app).post(`/api/v1/networks/${networkCode}/gateways`).send(mockGateways[2]);
      expect(res.status).toBe(401);
    });
    it('should return 403 if user is not Admin or Operator', async () => {
        (authService.processToken as jest.Mock).mockImplementation(() => {
             throw new InsufficientRightsError("Forbidden");
        });
        const res = await request(app).post(`/api/v1/networks/${networkCode}/gateways`).set('Authorization', 'Bearer viewer-token').send(mockGateways[2]);
        expect(res.status).toBe(403);
    });
    it.each([['Admin', mockAdmin],['Operator', mockOperator],])("should return 404 if network does not exist", async (_,role) => {
      (authService.processToken as jest.Mock).mockResolvedValue(role);
      (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network not found");
      });
      const newGateway = {
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "New Gateway",
        description: "Trying to attach to non-existent network"
      };
      const res = await request(app).post(`/api/v1/networks/NONEXISTENT/gateways`).set("Authorization", mockToken).send(newGateway);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Network not found");
    });  
    it.each([['Admin', mockAdmin],['Operator', mockOperator],])('should return 409 if macAddress is already used', async (_,role) => {
      (authService.processToken as jest.Mock).mockResolvedValue(role);
      (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
        throw new ConflictError("MAC address already in use");
      });
      const conflictingGateway = {
        macAddress: gatewayMac,
        name: "Duplicate Gateway",
        description: "Conflict test"
      };
      const res = await request(app).post(`/api/v1/networks/${networkCode}/gateways`).set("Authorization", mockToken).send(conflictingGateway);
      expect(res.status).toBe(409);
      expect(res.body.message).toBe("MAC address already in use");
    });
  });
  describe("Get a specific Gateway",()=>{
    it.each(Users)('should return 200 and the gateway if found and user is authenticated', async (role) => {
      (authService.processToken as jest.Mock).mockResolvedValue(role);
      (gatewayController.getGateway as jest.Mock).mockResolvedValue(mockGateways[3]);
      await request(app).post(`/api/v1/networks/${networkCode}/gateways`).set('Authorization', 'Bearer valid-token').send(mockGateways[3]);
      const res = await request(app).get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`).set('Authorization', 'Bearer valid-token');
      expect(res.status).toBe(200);
      expect(res.body.macAddress).toBe(gatewayMac);
    });
    it('should return 401 if user is not authenticated', async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });
      const res = await request(app).get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`);
        expect(res.status).toBe(401);
    }); 
    it.each(Users)('should return 404 if network or gateway is not found', async (role) => {
      (authService.processToken as jest.Mock).mockResolvedValue(role);
      (gatewayController.getGateway as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Gateway not found");
      });
      const res = await request(app).get(`/api/v1/networks/nonexistent-network/gateways/${gatewayMac}`).set('Authorization', 'Bearer valid-token');
      expect(res.status).toBe(404);
    }); 
    it.each(Users)('should return 404 if gateway is not found in an existing network', async (role) => {
      (authService.processToken as jest.Mock).mockResolvedValue(role);
      (gatewayController.getGateway as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network not found");
      });
      const res = await request(app).get(`/api/v1/networks/${networkCode}/gateways/nonexistent-mac`).set('Authorization', 'Bearer valid-token');
      expect(res.status).toBe(404);
    });   
  });
  describe("Patch, update a gateway",()=>{
    it.each([['Admin', mockAdmin],['Operator', mockOperator],])('should return 200 if gateway is successfully updated', async (_,role) => {
      (authService.processToken as jest.Mock).mockResolvedValue(role);
      await request(app).post(`/api/v1/networks/${networkCode}/gateways`).set('Authorization', 'Bearer valid-token').send(mockGateways[0]);
      const res = await request(app).patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`).set('Authorization', 'Bearer valid-token').send(mockGateways[4]);
      expect(res.status).toBe(204);
    });
    it('should return 401 if user is not authenticated', async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });
      const res = await request(app).patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`).send(mockGateways[4]);
      expect(res.status).toBe(401);
    });
    it('should return 403 if user is authenticated but not admin/operator', async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden");
      });
      const res = await request(app).patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`).set('Authorization', 'Bearer valid-token').send(mockGateways[4]);
      expect(res.status).toBe(403);
    });
    it.each([['Admin', mockAdmin],['Operator', mockOperator],])('should return 404 if the gateway or network does not exist', async (_,role) => {
      (authService.processToken as jest.Mock).mockResolvedValue(role);
      jest.spyOn(gatewayController, "updateGateway").mockImplementation(() => {
          throw new NotFoundError("Gateway or Network not found");
      });
      const res = await request(app).patch(`/api/v1/networks/nonexistent-network/gateways/${gatewayMac}`).set("Authorization", "Bearer valid-token").send(mockGateways[4]);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Gateway or Network not found");
    });
    it.each([['Admin', mockAdmin],['Operator', mockOperator],])('should return 409 if the new MAC address is already in use', async (_,role) => {
      (authService.processToken as jest.Mock).mockResolvedValue(role);
      (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
        throw new ConflictError("MAC address already in use");
      });
      const res = await request(app).patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`).set('Authorization', 'Bearer valid-token').send(mockGateways[4]); 
      expect(res.status).toBe(409);
    });    
    it.each([['Admin', mockAdmin],['Operator', mockOperator],])('should return 400 if input data is invalid', async (_,role) => {
      (authService.processToken as jest.Mock).mockResolvedValue(role);
      const res = await request(app).patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`).set('Authorization', 'Bearer valid-token').send({ name: null }); 
      expect(res.status).toBe(400);
    }); 
  });
  describe(" Delete a gateway",()=>{
    it.each([['Admin', mockAdmin],['Operator', mockOperator],])('should return 204 if gateway is successfully deleted', async (_,role) => {
      (authService.processToken as jest.Mock).mockResolvedValue(role);
      await request(app).post(`/api/v1/networks/${networkCode}/gateways`).set('Authorization', mockToken).send(mockGateways[0]);
      const res = await request(app).delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`).set('Authorization', mockToken);
      expect(res.status).toBe(204);
    });
    it('should return 401 if user is not authenticated', async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });
      const res = await request(app).delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`);
      expect(res.status).toBe(401);
    });
    it('should return 403 if user is authenticated but lacks permissions', async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden");
      });
      const res = await request(app).delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`).set('Authorization', mockToken);
      expect(res.status).toBe(403);
    });
    it.each([['Admin', mockAdmin],['Operator', mockOperator],])('should return 404 if network or gateway does not exist', async (_,role) => {
      (authService.processToken as jest.Mock).mockResolvedValue(role);
      jest.spyOn(gatewayController, "deleteGateway").mockImplementation(() => {
          throw new NotFoundError("Network or Gateway not found");
      });
      const res = await request(app).delete(`/api/v1/networks/nonexistent-network/gateways/99:99:99:99:99:99`).set("Authorization", "Bearer valid-token");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Network or Gateway not found");
    });    
  });
});