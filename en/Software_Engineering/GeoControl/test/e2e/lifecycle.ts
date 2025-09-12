import {
  initializeTestDataSource,
  closeTestDataSource
} from "@test/setup/test-datasource";
import { UserRepository } from "@repositories/UserRepository";
import { UserType } from "@models/UserType";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { MeasurementRepository } from "@repositories/MeasurementRepository";

export const TEST_USERS = {
  admin: { username: "admin", password: "adminpass", type: UserType.Admin },
  operator: { username: "operator", password: "operatorpass", type: UserType.Operator },
  viewer: { username: "viewer", password: "viewerpass", type: UserType.Viewer },
  admin2: { username: "admin2", password: "testpass", type: UserType.Admin },
  operator2: { username: "operator2", password: "testpass", type: UserType.Operator },
  viewer2: { username: "viewer2", password: "testpass", type: UserType.Viewer }
};

export const TEST_NETWORKS = {
  // Networks used in tests, must not be added to the database
  net_x: {
    code: "net_x",
    name: "X",
    description: "X"
  },
  net_new: {
    code: "NEWNET",
    name: "New network",
    description: "Used to create a new network"
  },
  net_updated: {
    code: "NEWCODE",
    name: "X",
    description: "X"
  },
  net_malformed: {
    name: "No Code",
    description: "Missing code"
  },
  net_invalidCodeMinLength: {
    code: "",
    name: "No Code",
    description: "Missing code"
  },
  // Networks added to the database
  net01: {
    code: "NET01",
    name: "Alp Monitor",
    description: "Alpine Weather Monitoring Network"
  },
  net02: {
    code: "NET02",
    name: "City Sensors",
    description: "Urban Sensor Grid"
  },
  net03: {
    code: "NET03",
    name: "Test Network",
    description: "Network for testing"
  },
  network1: { code: "net-001", name: "Network 1", description: "Test network 1" },
  network2: { code: "net-002", name: "Network 2", description: "Test network 2" },
  network3: { code: "net-003", name: "Network 3", description: "Test network 3" }
};

export const TEST_GATEWAYS = {
  gateway1: { macAddress: "00:11:22:33:44:55", name: "Gateway 1", description: "Test gateway 1" },
  gateway2: { macAddress: "66:77:88:99:AA:BB", name: "Gateway 2", description: "Test gateway 2" },
  gateway3: { macAddress: "CC:DD:EE:FF:00:11", name: "Gateway 3", description: "Test gateway 3" },
  gateway4: { macAddress: "AA:BB:CC:DD:EE:01", name: "Gateway Alpha", description: "Main gateway for Alpine sensors", sensors: " " },
  gatewayToOverwrite: {
    macAddress: "AA:BB:CC:DD:EE:99",  // MAC identico a gateway1, quindi sovrascrive
    name: "Gateway Alpha Updated",
    description: "Updated description for the Alpine gateway",
    sensors: "sensor1"
  },
  malformedGateway: {
    macAddress: "  a",// manca mac address, campo obbligatorio
    name: "",  // nome vuoto (potrebbe essere obbligatorio)
    description: "",  // tipo errato: description dovrebbe essere stringa
    sensors: "not-an-array"  // tipo errato: dovrebbe essere array
  }
};

export const TEST_SENSORS = {
  sensor1: { macAddress: "AA:BB:CC:DD:EE:FF", name: "Sensor 1", description: "Test sensor 1", variable: "temperature", unit: "C" },
  sensor2: { macAddress: "11:22:33:44:55:66", name: "Sensor 2", description: "Test sensor 2", variable: "humidity", unit: "%" },
  sensor3: { macAddress: "77:88:99:AA:BB:CC", name: "Sensor 3", description: "Test sensor 3", variable: "pressure", unit: "Pa" }
};

export const TEST_MEASUREMENTS = {
  m1: {
    networkCode: TEST_NETWORKS.network1.code,
    gatewayMac: TEST_GATEWAYS.gateway1.macAddress,
    sensorMac: TEST_SENSORS.sensor1.macAddress,
    createdAt: new Date("2025-02-18T16:00:00Z"),
    value: 21.85
  },
  m2: {
    networkCode: TEST_NETWORKS.network1.code,
    gatewayMac: TEST_GATEWAYS.gateway1.macAddress,
    sensorMac: TEST_SENSORS.sensor2.macAddress,
    createdAt: new Date("2025-02-18T16:05:00Z"),
    value: 55.12
  },
  m3: {
    networkCode: TEST_NETWORKS.network2.code,
    gatewayMac: TEST_GATEWAYS.gateway3.macAddress,
    sensorMac: TEST_SENSORS.sensor3.macAddress,
    createdAt: new Date("2025-02-18T16:10:00Z"),
    value: 1013.2
  },
  m4: {
    networkCode: TEST_NETWORKS.network1.code,
    gatewayMac: TEST_GATEWAYS.gateway1.macAddress,
    sensorMac: TEST_SENSORS.sensor1.macAddress,
    createdAt: new Date("2025-02-18T17:00:00Z"),
    value: 23.45
  },
};

export async function beforeAllE2e() {
  await initializeTestDataSource();

  // Populate the database with test users
  const UsersRepo = new UserRepository();
  await UsersRepo.createUser(
    TEST_USERS.admin.username,
    TEST_USERS.admin.password,
    TEST_USERS.admin.type
  );
  await UsersRepo.createUser(
    TEST_USERS.operator.username,
    TEST_USERS.operator.password,
    TEST_USERS.operator.type
  );
  await UsersRepo.createUser(
    TEST_USERS.viewer.username,
    TEST_USERS.viewer.password,
    TEST_USERS.viewer.type
  );
  await UsersRepo.createUser(
    TEST_USERS.admin2.username,
    TEST_USERS.admin2.password,
    TEST_USERS.admin2.type
  );
  await UsersRepo.createUser(
    TEST_USERS.operator2.username,
    TEST_USERS.operator2.password,
    TEST_USERS.operator2.type
  );
  await UsersRepo.createUser(
    TEST_USERS.viewer2.username,
    TEST_USERS.viewer2.password,
    TEST_USERS.viewer2.type
  );

  // Crea reti di test
  const networkRepo = new NetworkRepository();
  await networkRepo.createNewNetwork(
    TEST_NETWORKS.net01.code,
    TEST_NETWORKS.net01.name,
    TEST_NETWORKS.net01.description
  );
  await networkRepo.createNewNetwork(
    TEST_NETWORKS.net02.code,
    TEST_NETWORKS.net02.name,
    TEST_NETWORKS.net02.description
  );
  await networkRepo.createNewNetwork(
    TEST_NETWORKS.net03.code,
    TEST_NETWORKS.net03.name,
    TEST_NETWORKS.net03.description
  );
  // Crea reti di test
  const gatewayRepo = new GatewayRepository();
  await gatewayRepo.createGateway(
    TEST_NETWORKS.net01.code,
    TEST_GATEWAYS.gateway4.macAddress,
    TEST_GATEWAYS.gateway4.name,
    TEST_GATEWAYS.gateway4.description
  );
  await gatewayRepo.createGateway(
    TEST_NETWORKS.net01.code,
    TEST_GATEWAYS.gatewayToOverwrite.macAddress,
    TEST_GATEWAYS.gatewayToOverwrite.name,
    TEST_GATEWAYS.gatewayToOverwrite.description
  );
  await gatewayRepo.createGateway(
    TEST_NETWORKS.net01.code,
    TEST_GATEWAYS.malformedGateway.macAddress,
    TEST_GATEWAYS.malformedGateway.name,
    TEST_GATEWAYS.malformedGateway.description
  );

  // Populate the database with test networks
  const NetworksRepo = new NetworkRepository();
  await NetworksRepo.createNewNetwork(
    TEST_NETWORKS.network1.code,
    TEST_NETWORKS.network1.name,
    TEST_NETWORKS.network1.description
  );
  await NetworksRepo.createNewNetwork(
    TEST_NETWORKS.network2.code,
    TEST_NETWORKS.network2.name,
    TEST_NETWORKS.network2.description
  );
  await NetworksRepo.createNewNetwork(
    TEST_NETWORKS.network3.code,
    TEST_NETWORKS.network3.name,
    TEST_NETWORKS.network3.description
  );

  // Populate the database with test gateways
  const GatewaysRepo = new GatewayRepository();
  await GatewaysRepo.createGateway(
    TEST_NETWORKS.network1.code,
    TEST_GATEWAYS.gateway1.macAddress,
    TEST_GATEWAYS.gateway1.name,
    TEST_GATEWAYS.gateway1.description
  );
  await GatewaysRepo.createGateway(
    TEST_NETWORKS.network1.code,
    TEST_GATEWAYS.gateway2.macAddress,
    TEST_GATEWAYS.gateway2.name,
    TEST_GATEWAYS.gateway2.description
  );
  await GatewaysRepo.createGateway(
    TEST_NETWORKS.network2.code,
    TEST_GATEWAYS.gateway3.macAddress,
    TEST_GATEWAYS.gateway3.name,
    TEST_GATEWAYS.gateway3.description
  );

  // Populate the database with test sensors
  const SensorsRepo = new SensorRepository();
  await SensorsRepo.createSensor(
    TEST_NETWORKS.network1.code,
    TEST_GATEWAYS.gateway1.macAddress,
    TEST_SENSORS.sensor1.macAddress,
    TEST_SENSORS.sensor1.name,
    TEST_SENSORS.sensor1.description,
    TEST_SENSORS.sensor1.variable,
    TEST_SENSORS.sensor1.unit
  );
  await SensorsRepo.createSensor(
    TEST_NETWORKS.network1.code,
    TEST_GATEWAYS.gateway1.macAddress,
    TEST_SENSORS.sensor2.macAddress,
    TEST_SENSORS.sensor2.name,
    TEST_SENSORS.sensor2.description,
    TEST_SENSORS.sensor2.variable,
    TEST_SENSORS.sensor2.unit
  );
  await SensorsRepo.createSensor(
    TEST_NETWORKS.network2.code,
    TEST_GATEWAYS.gateway3.macAddress,
    TEST_SENSORS.sensor3.macAddress,
    TEST_SENSORS.sensor3.name,
    TEST_SENSORS.sensor3.description,
    TEST_SENSORS.sensor3.variable,
    TEST_SENSORS.sensor3.unit
  );
  //populate DB with test measurements
  const measurementRepo = new MeasurementRepository();
  await measurementRepo.createMeasurement(
    TEST_MEASUREMENTS.m1.networkCode,
    TEST_MEASUREMENTS.m1.gatewayMac,
    TEST_MEASUREMENTS.m1.sensorMac,
    TEST_MEASUREMENTS.m1.createdAt,
    TEST_MEASUREMENTS.m1.value
  );
  await measurementRepo.createMeasurement(
    TEST_MEASUREMENTS.m2.networkCode,
    TEST_MEASUREMENTS.m2.gatewayMac,
    TEST_MEASUREMENTS.m2.sensorMac,
    TEST_MEASUREMENTS.m2.createdAt,
    TEST_MEASUREMENTS.m2.value
  );
  await measurementRepo.createMeasurement(
    TEST_MEASUREMENTS.m3.networkCode,
    TEST_MEASUREMENTS.m3.gatewayMac,
    TEST_MEASUREMENTS.m3.sensorMac,
    TEST_MEASUREMENTS.m3.createdAt,
    TEST_MEASUREMENTS.m3.value
  );
  await measurementRepo.createMeasurement(
    TEST_MEASUREMENTS.m4.networkCode,
    TEST_MEASUREMENTS.m4.gatewayMac,
    TEST_MEASUREMENTS.m4.sensorMac,
    TEST_MEASUREMENTS.m4.createdAt,
    TEST_MEASUREMENTS.m4.value
  );

}
export async function afterAllE2e() {
  await closeTestDataSource();
}
