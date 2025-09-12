import { GatewayRepository } from "@repositories/GatewayRepository";
import{ initializeTestDataSource,
  closeTestDataSource,
  TestDataSource} from "@test/setup/test-datasource"
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NetworkRepository } from "@repositories/NetworkRepository";
beforeAll(async () => {
  await initializeTestDataSource();

});

afterAll(async () => {
  await closeTestDataSource();
});
const networkCode = "Net01";
const gateRepo=new GatewayRepository();
const netRepo= new NetworkRepository();
beforeEach(async () => {
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
  await  netRepo.createNewNetwork("Net01","Pluto","For the plot"); 
});

describe("GatewayRepository: SQLite in-memory", ()=> {
        it("Create Gateway", async() => {
        
            const gateway= await gateRepo.createGateway("Net01","AA:BB:CC:DD:EE:68","Pippo","Description");
            expect(gateway).toMatchObject({
                macAddress: "AA:BB:CC:DD:EE:68",
                name: "Pippo",
                description: "Description",
                network: expect.objectContaining({
                    code: "Net01",
                }),
            });
            const saved = await TestDataSource.getRepository(GatewayDAO).findOne({
                where: { macAddress: "AA:BB:CC:DD:EE:68" },
                relations: ["network"], 
            });

            expect(saved).not.toBeNull();
            expect(saved?.macAddress).toBe("AA:BB:CC:DD:EE:68");
            expect(saved?.network.code).toBe("Net01");
        });
        it("should throw NotFoundError if networkCode does not exist", async () => {
            await expect(gateRepo.createGateway("NonExistentCode", "AA:BB:CC:DD:EE:01", "Name", "Desc")).rejects.toThrow(NotFoundError);
        });
        it("should throw ConflictError if macAddress already exists", async () => {
            await gateRepo.createGateway("Net01", "AA:BB:CC:DD:EE:01", "Gateway1", "First");
            await expect(gateRepo.createGateway("Net01", "AA:BB:CC:DD:EE:01", "Gateway2", "Duplicate MAC")).rejects.toThrow(ConflictError);
        });
        it("should throw error if name is missing", async () => {
            await expect(gateRepo.createGateway("Net01", "AA:BB:CC:DD:EE:02", null, "No name")).rejects.toThrow(Error); 
        });
        it("should throw error if macAddress is invalid", async () => {
            await expect(gateRepo.createGateway("Net01", null, "Name", "Description")).rejects.toThrow(Error); 
        });
        it("Get all gateways owned by a specific networkCode",async ()=>{
            
            await gateRepo.createGateway(networkCode, "AA:BB:CC:DD:EE:11", "Gateway1", "Desc1");
            await gateRepo.createGateway(networkCode, "AA:BB:CC:DD:EE:12", "Gateway2", "Desc2");
            const gateways = await gateRepo.getAllGateways(networkCode);
            expect(gateways).toHaveLength(2);
            expect(gateways).toEqual(expect.arrayContaining([expect.objectContaining({
                macAddress: "AA:BB:CC:DD:EE:11",
                name: "Gateway1",
                description: "Desc1",
            }),
            expect.objectContaining({
                macAddress: "AA:BB:CC:DD:EE:12",
                name: "Gateway2",
                description: "Desc2",
            }),]));
        });
        it("should return empty array if no gateways are present", async () => {
            const gateways = await gateRepo.getAllGateways("Net01");
            expect(gateways).toEqual([]);
        });
        it("should throw NotFoundError if network does not exist", async () => {
            await expect(gateRepo.getAllGateways("InvalidCode")).rejects.toThrow(NotFoundError);
        });
        it("should return a single gateway by mac and networkCode", async () => {
            const mac = "AA:BB:CC:DD:EE:21";
            await gateRepo.createGateway(networkCode, mac, "GatewayTest", "TestDesc");
            const gateway = await gateRepo.getGateway(networkCode, mac);
            expect(gateway).toMatchObject({
                macAddress: mac,
                name: "GatewayTest",
                description: "TestDesc",
                network: expect.objectContaining({ code: networkCode }),
            });
        });
        it("should throw NotFoundError if gateway does not exist in the given network", async () => {
            await expect(gateRepo.getGateway("Net01", "AA:BB:CC:DD:EE:99")).rejects.toThrow(NotFoundError);
        });
        it("should throw NotFoundError if network does not exist", async () => {
        await expect(gateRepo.getGateway("WrongNet", "AA:BB:CC:DD:EE:21")).rejects.toThrow(NotFoundError);
        });
        it("should update gateway name and description", async () => {
        const mac = "AA:BB:CC:DD:EE:01";
            await gateRepo.createGateway("Net01", mac, "OldName", "OldDesc");
            await gateRepo.updateGateway("Net01", mac, mac, "NewName", "NewDesc");
            const updated = await TestDataSource.getRepository(GatewayDAO).findOne({
                where: { macAddress: mac },
            });
            expect(updated?.name).toBe("NewName");
            expect(updated?.description).toBe("NewDesc");
        });
        it("should update the macAddress if it is unique", async () => {
            const oldMac = "AA:BB:CC:DD:EE:02";
            const newMac = "AA:BB:CC:DD:EE:99";
            await gateRepo.createGateway("Net01", oldMac, "GatewayName", "Description");
            await gateRepo.updateGateway("Net01", oldMac, newMac, "SameName", "SameDesc");
            const updated = await TestDataSource.getRepository(GatewayDAO).findOne({
                where: { macAddress: newMac },
            });
            expect(updated).not.toBeNull();
            expect(updated?.macAddress).toBe(newMac);
            expect(updated?.name).toBe("SameName");
            const old = await TestDataSource.getRepository(GatewayDAO).findOne({
                where: { macAddress: oldMac },
            });
            expect(old).toBeNull(); 
        });
        it("should throw ConflictError if new macAddress is already used", async () => {
            const mac1 = "AA:BB:CC:DD:EE:03";
            const mac2 = "AA:BB:CC:DD:EE:04";
            await gateRepo.createGateway("Net01", mac1, "GW1", "Desc1");
            await gateRepo.createGateway("Net01", mac2, "GW2", "Desc2");
            await expect(gateRepo.updateGateway("Net01", mac1, mac2, "NewName", "NewDesc")).rejects.toThrow(ConflictError);
        });
        it("should throw NotFoundError if gateway does not exist", async () => {
            await expect(gateRepo.updateGateway("Net01", "AA:BB:CC:DD:EE:05", "NEW:MAC:01", "Name", "Desc")).rejects.toThrow(NotFoundError);
        });
        it("should throw NotFoundError if network does not exist", async () => {
            await expect(gateRepo.updateGateway("FakeNet", "AA:BB:CC:DD:EE:06", "NEW:MAC:02", "Name", "Desc")).rejects.toThrow(NotFoundError);
        });
        it("should not change fields if new values are same as current", async () => {
            const mac = "AA:BB:CC:DD:EE:07";
            await gateRepo.createGateway("Net01", mac, "SameName", "SameDesc");
            await gateRepo.updateGateway("Net01", mac, mac, "SameName", "SameDesc");
            const updated = await TestDataSource.getRepository(GatewayDAO).findOne({
                where: { macAddress: mac },
            });
            expect(updated?.name).toBe("SameName");
            expect(updated?.description).toBe("SameDesc");
        });
        it("should delete a gateway correctly", async () => {
            const mac = "AA:BB:CC:DD:EE:10";
            await gateRepo.createGateway("Net01", mac, "ToDelete", "To be removed");
            await gateRepo.deleteGateway("Net01", mac);
            const result = await TestDataSource.getRepository(GatewayDAO).findOne({
                where: { macAddress: mac },
            });
            expect(result).toBeNull();
        });
        it("should throw NotFoundError if gateway does not exist", async () => {
            await expect(gateRepo.deleteGateway("Net01", "ZZ:ZZ:ZZ:ZZ:ZZ:ZZ")).rejects.toThrow(NotFoundError);
         });
        it("should throw NotFoundError if network does not exist", async () => {
            const mac = "AA:BB:CC:DD:EE:11";
            await gateRepo.createGateway("Net01", mac, "Valid", "Exists");
            await expect(gateRepo.deleteGateway("NonExistentNetwork", mac)).rejects.toThrow(NotFoundError);
        });
});



