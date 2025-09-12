import { SensorRepository } from "@repositories/SensorRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { SensorDAO } from "@dao/SensorDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
    await TestDataSource.getRepository(SensorDAO).clear();
    await TestDataSource.getRepository(GatewayDAO).clear();
    await TestDataSource.getRepository(NetworkDAO).clear();
  });
  

describe("SensorRepository: SQLite in-memory", () => {
  const sensorRepo = new SensorRepository();
  const gatewayRepo = new GatewayRepository();
  const networkRepo = new NetworkRepository();

  async function setupNetworkAndGateway() {
    await networkRepo.createNewNetwork("NET01", "Test Network", "Test");
    await gatewayRepo.createGateway("NET01", "GW01", "Gateway", "desc");
  }

  // === CREATION ===
  it("create sensor", async () => {
    await setupNetworkAndGateway();
    const sensor = await sensorRepo.createSensor(
      "NET01", "GW01", "MAC01", "Sensor1", "desc", "temperature", "°C"
    );
    expect(sensor.macAddress).toBe("MAC01");

    const fetched = await sensorRepo.getSensor("NET01", "GW01", "MAC01");
    expect(fetched.name).toBe("Sensor1");
  });

  it("create sensor: conflict on MAC", async () => {
    await setupNetworkAndGateway();
    await sensorRepo.createSensor("NET01", "GW01", "MAC01", "S1", "d", "v", "u");

    await expect(
      sensorRepo.createSensor("NET01", "GW01", "MAC01", "S2", "d", "v", "u")
    ).rejects.toThrow(ConflictError);
  });

  // === READ ===
  it("get all sensors", async () => {
    await setupNetworkAndGateway();
    await sensorRepo.createSensor("NET01", "GW01", "MAC01", "S1", "d", "v", "u");
    await sensorRepo.createSensor("NET01", "GW01", "MAC02", "S2", "d", "v", "u");

    const sensors = await sensorRepo.getAllSensors("NET01", "GW01");
    expect(sensors.length).toBe(2);
  });

  it("get sensor: not found", async () => {
    await setupNetworkAndGateway();
    await expect(
      sensorRepo.getSensor("NET01", "GW01", "NOPE")
    ).rejects.toThrow(NotFoundError);
  });

  // === UPDATE ===
  it("update sensor: change MAC and fields", async () => {
    await setupNetworkAndGateway();
    await sensorRepo.createSensor("NET01", "GW01", "OLD", "Old", "Desc", "var", "unit");

    const updated = await sensorRepo.updateSensor(
      "NET01", "GW01", "OLD", "NEW", "New", "New Desc", "temperature", "°C"
    );

    expect(updated.macAddress).toBe("NEW");
    expect(updated.name).toBe("New");
    expect(updated.description).toBe("New Desc");
    expect(updated.variable).toBe("temperature");
    expect(updated.unit).toBe("°C");
  });

  it("update sensor: update only fields", async () => {
    await setupNetworkAndGateway();
    await sensorRepo.createSensor("NET01", "GW01", "MAC01", "Old", "Old Desc", "humidity", "%");

    const updated = await sensorRepo.updateSensor(
      "NET01", "GW01", "MAC01", "MAC01", "New", "Desc", "temperature", "°C"
    );

    expect(updated.name).toBe("New");
    expect(updated.description).toBe("Desc");
    expect(updated.variable).toBe("temperature");
    expect(updated.unit).toBe("°C");
  });

  it("update sensor: conflict on new MAC", async () => {
    await setupNetworkAndGateway();
    await sensorRepo.createSensor("NET01", "GW01", "OLD", "S1", "d", "v", "u");
    await sensorRepo.createSensor("NET01", "GW01", "NEW", "S2", "d", "v", "u");

    await expect(
      sensorRepo.updateSensor("NET01", "GW01", "OLD", "NEW", "", "", "", "")
    ).rejects.toThrow(ConflictError);
  });

  // === DELETE ===
  it("delete sensor", async () => {
    await setupNetworkAndGateway();
    await sensorRepo.createSensor("NET01", "GW01", "MAC01", "S", "d", "v", "u");

    await sensorRepo.deleteSensor("NET01", "GW01", "MAC01");

    await expect(
      sensorRepo.getSensor("NET01", "GW01", "MAC01")
    ).rejects.toThrow(NotFoundError);
  });

  it("delete sensor: not found", async () => {
    await setupNetworkAndGateway();

    await expect(
      sensorRepo.deleteSensor("NET01", "GW01", "NOPE")
    ).rejects.toThrow(NotFoundError);
  });
});