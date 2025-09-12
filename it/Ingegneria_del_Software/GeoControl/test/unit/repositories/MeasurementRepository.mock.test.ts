import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkDAO } from "@dao/NetworkDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { SensorDAO } from "@dao/SensorDAO";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { Between, In } from "typeorm";
import { AppDataSource } from "@database";
import { MeasurementRepository } from "@repositories/MeasurementRepository";

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockFindOne = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      findOne: mockFindOne,
      save: mockSave,
      update: mockUpdate,
      delete: mockDelete,
    })
  }
}));

describe("MeasurementRepository: mocked database", () => {

    const repo = new MeasurementRepository();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("create measurement", async () => {

            mockFind
                .mockResolvedValueOnce([{ code: "networkCode1" }]) 
                .mockResolvedValueOnce([{ macAddress: "11:11:11:11:11:11" }]) 
                .mockResolvedValueOnce([{ macAddress: "33:33:33:33:33:33" }]); 
            // Simulate an existing sensor
            const existingSensor = new SensorDAO();
            existingSensor.macAddress = "33:33:33:33:33:33";
            existingSensor.name = "Sensor Name 1";
            existingSensor.description = "Sensor Description 1";
            existingSensor.variable = "Temperature";
            existingSensor.unit = "Celsius";
            existingSensor.gateway = new GatewayDAO();
            existingSensor.gateway.macAddress = "11:11:11:11:11:11";
            existingSensor.gateway.name = "Gateway Name 1";
            existingSensor.gateway.description = "G Description 1";
            existingSensor.gateway.network = new NetworkDAO();
            existingSensor.gateway.network.code = "networkCode1";
            existingSensor.gateway.network.name = "Network Name";
            existingSensor.gateway.network.description = "Description 1";
            mockFindOne.mockResolvedValue(existingSensor);

            // Simulate a new measurement
            const newMeasurement = new MeasurementDAO();
            newMeasurement.createdAt = new Date("2025-05-01T10:00:00Z");
            newMeasurement.value = 25.5;
            newMeasurement.sensor = existingSensor;
            mockSave.mockResolvedValue(newMeasurement);
            const result = await repo.createMeasurement("networkCode1", "11:11:11:11:11:11", "33:33:33:33:33:33", new Date("2025-05-01T10:00:00Z"), 25.5);

            //check that the saved measurement is the same as the one we created
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(MeasurementDAO);
            expect(result.createdAt).toEqual(new Date("2025-05-01T10:00:00Z"));
            expect(result.value).toEqual(25.5);
            expect(result.sensor.macAddress).toEqual("33:33:33:33:33:33");
            expect(result.sensor.name).toEqual("Sensor Name 1");
            expect(result.sensor.description).toEqual("Sensor Description 1");
            expect(result.sensor.variable).toEqual("Temperature");
            expect(result.sensor.unit).toEqual("Celsius");
            expect(result.sensor.gateway.macAddress).toEqual("11:11:11:11:11:11");
            expect(result.sensor.gateway.name).toEqual("Gateway Name 1");
            expect(result.sensor.gateway.description).toEqual("G Description 1");
            expect(result.sensor.gateway.network.code).toEqual("networkCode1");
            expect(result.sensor.gateway.network.name).toEqual("Network Name");
            expect(result.sensor.gateway.network.description).toEqual("Description 1");

            expect(mockFind).toHaveBeenCalled();

    });

    it("create measurement: sensor not found - NotFoundError thrown", async () => {
            mockFind
                .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
                .mockResolvedValueOnce([{ macAddress: "11:11:11:11:11:11" }]); // Gateway exists

            mockFind.mockResolvedValueOnce([]); // Sensor not found

            await expect(
                repo.createMeasurement(
                    "networkCode1",
                    "11:11:11:11:11:11",
                    "33:33:33:33:33:33",
                    new Date("2025-05-01T10:00:00Z"),
                    25.5
                )
            ).rejects.toThrow(NotFoundError);

            expect(mockFind).toHaveBeenCalled();
    });

    it("create measurement: incorrect gatewayMac  - NotFoundError thrown", async () => {
      // Mock Network trovato
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]); // Network exists

        // Mock Gateway non trovato
        mockFind.mockResolvedValueOnce([]); // Gateway not found

        await expect(
            repo.createMeasurement(
                "networkCode1",
                "wrong-gateway-mac",
                "33:33:33:33:33:33",
                new Date("2025-05-01T10:00:00Z"),
                25.5
            )
        ).rejects.toThrow(NotFoundError);

        expect(mockFind).toHaveBeenCalled();   
    });

    it("create measurement: incorrect networkCode  - NotFoundError thrown", async () => {
            // Mock Network non trovato
        mockFind.mockResolvedValueOnce([]); // Network not found

        await expect(
            repo.createMeasurement(
                "wrong-network-code",
                "11:11:11:11:11:11",
                "33:33:33:33:33:33",
                new Date("2025-05-01T10:00:00Z"),
                25.5
            )
        ).rejects.toThrow(NotFoundError);

        expect(mockFind).toHaveBeenCalled();  
    });

    it("getMeasurementsBySensor without starDate or endDate", async () => {

        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([{ macAddress: "11:11:11:11:11:11" }]) // Gateway exists
            .mockResolvedValueOnce([{ macAddress: "33:33:33:33:33:33" }]); // Sensor exists

        const measurement1 = new MeasurementDAO();
        measurement1.createdAt = new Date("2025-05-01T10:00:00Z");
        measurement1.value = 25.5;
        const measurement2 = new MeasurementDAO();
        measurement2.createdAt = new Date("2025-05-01T11:00:00Z");
        measurement2.value = 26.0;
        mockFind.mockResolvedValueOnce([measurement1, measurement2]);

        const result = await repo.getSensorMeasurements(
            "networkCode1",
            "11:11:11:11:11:11",
            "33:33:33:33:33:33",
            undefined,
            undefined
        );

        expect(result).toBeDefined();
        expect(result.sensorMacAddress).toBe("33:33:33:33:33:33");
        expect(result.measurements.length).toBe(2);
        expect(result.measurements[0].value).toBe(25.5);
        expect(result.measurements[1].value).toBe(26.0);
        expect(mockFind).toHaveBeenCalled();
    });

     
    it("getMeasurementsBySensor with startDate and endDate", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([{ macAddress: "11:11:11:11:11:11" }]) // Gateway exists
            .mockResolvedValueOnce([{ macAddress: "33:33:33:33:33:33" }]); // Sensor exists

        const measurement1 = new MeasurementDAO();
        measurement1.createdAt = new Date("2025-05-01T10:00:00Z");
        measurement1.value = 25.5;
        const measurement2 = new MeasurementDAO();
        measurement2.createdAt = new Date("2025-05-01T11:00:00Z");
        measurement2.value = 26.0;
        mockFind.mockResolvedValueOnce([measurement1, measurement2]);

        const result = await repo.getSensorMeasurements(
            "networkCode1",
            "11:11:11:11:11:11",
            "33:33:33:33:33:33",
            "2025-05-01T09:00:00Z",
            "2025-05-01T12:00:00Z"
        );

        expect(result).toBeDefined();
        expect(result.sensorMacAddress).toBe("33:33:33:33:33:33");
        expect(result.measurements.length).toBe(2);
        expect(result.measurements[0].value).toBe(25.5);
        expect(result.measurements[1].value).toBe(26.0);
        expect(mockFind).toHaveBeenCalled();
    });

    it("getMeasurementsBySensor with startDate and endDate that return no data", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([{ macAddress: "11:11:11:11:11:11" }]) // Gateway exists
            .mockResolvedValueOnce([{ macAddress: "33:33:33:33:33:33" }]); // Sensor exists

        mockFind.mockResolvedValueOnce([]); // Nessuna misura trovata

        const result = await repo.getSensorMeasurements(
            "networkCode1",
            "11:11:11:11:11:11",
            "33:33:33:33:33:33",
            "2024-01-01T00:00:00Z",
            "2024-01-02T00:00:00Z"
        );

        expect(result).toBeDefined();
        expect(result.sensorMacAddress).toBe("33:33:33:33:33:33");
        expect(result.measurements.length).toBe(0);
        expect(mockFind).toHaveBeenCalled();
    });

    it("getMeasurementsBySensor - test just one date", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([{ macAddress: "11:11:11:11:11:11" }]) // Gateway exists
            .mockResolvedValueOnce([{ macAddress: "33:33:33:33:33:33" }]); // Sensor exists

        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date("2025-05-01T10:00:00Z");
        measurement.value = 25.5;
        mockFind.mockResolvedValueOnce([measurement]);

        const result = await repo.getSensorMeasurements(
            "networkCode1",
            "11:11:11:11:11:11",
            "33:33:33:33:33:33",
            "2025-05-01T10:00:00Z",
            undefined
        );

        expect(result).toBeDefined();
        expect(result.sensorMacAddress).toBe("33:33:33:33:33:33");
        expect(result.measurements.length).toBe(1);
        expect(result.measurements[0].value).toBe(25.5);
        expect(mockFind).toHaveBeenCalled();
    });

    it("getMeasurementsByNetworkAndSensors without optional fields", async () => {
        // Mock network and sensors
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([
                { macAddress: "33:33:33:33:33:33", gateway: { macAddress: "11:11:11:11:11:11", network: { code: "networkCode1" } } }
            ]); // Sensors

        // Mock getSensorMeasurements
        const mockGetSensorMeasurements = jest.spyOn(repo, "getSensorMeasurements").mockResolvedValue({
            sensorMacAddress: "33:33:33:33:33:33",
            measurements: [{ value: 25.5, createdAt: new Date("2025-05-01T10:00:00Z") }]
        });

        const result = await repo.getSensorsNetworkMeasurements("networkCode1", ["33:33:33:33:33:33"], undefined, undefined);

        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0].sensorMacAddress).toBe("33:33:33:33:33:33");
        expect(result[0].measurements.length).toBe(1);
        expect(result[0].measurements[0].value).toBe(25.5);

        mockGetSensorMeasurements.mockRestore();
    });

    it("getMeasurementsByNetworkAndSensors with all optional fields", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([
                { macAddress: "33:33:33:33:33:33", gateway: { macAddress: "11:11:11:11:11:11", network: { code: "networkCode1" } } }
            ]); // Sensors

        const mockGetSensorMeasurements = jest.spyOn(repo, "getSensorMeasurements").mockResolvedValue({
            sensorMacAddress: "33:33:33:33:33:33",
            measurements: [
                { value: 25.5, createdAt: new Date("2025-05-01T10:00:00Z") },
                { value: 26.0, createdAt: new Date("2025-05-01T11:00:00Z") }
            ]
        });

        const result = await repo.getSensorsNetworkMeasurements(
            "networkCode1",
            ["33:33:33:33:33:33"],
            "2025-05-01T09:00:00Z",
            "2025-05-01T12:00:00Z"
        );

        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0].sensorMacAddress).toBe("33:33:33:33:33:33");
        expect(result[0].measurements.length).toBe(2);
        expect(result[0].measurements[1].value).toBe(26.0);

        mockGetSensorMeasurements.mockRestore();
    });

    it("getMeasurementsByNetworkAndSensors: wrong networkCode - throws EntityNotFoundError", async () => {
        mockFind.mockResolvedValueOnce([]); // Network not found

        await expect(
            repo.getSensorsNetworkMeasurements(
                "wrong-network-code",
                ["33:33:33:33:33:33"],
                undefined,
                undefined
            )
        ).rejects.toThrow(NotFoundError);

        expect(mockFind).toHaveBeenCalled();
    });

    it("getMeasurementsByNetworkAndSensors: wrong sensorMac - throws EntityNotFoundError", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([]); // Sensors not found

        const result = await repo.getSensorsNetworkMeasurements(
            "networkCode1",
            ["wrong-sensor-mac"],
            undefined,
            undefined
        );
        expect(result).toEqual([]);

        expect(mockFind).toHaveBeenCalled();
    });

    it("getMeasurementsByNetworkAndSensors: tests dates", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([
                { macAddress: "33:33:33:33:33:33", gateway: { macAddress: "11:11:11:11:11:11", network: { code: "networkCode1" } } }
            ]); // Sensors

        const mockGetSensorMeasurements = jest.spyOn(repo, "getSensorMeasurements").mockResolvedValue({
            sensorMacAddress: "33:33:33:33:33:33",
            measurements: [
                { value: 25.5, createdAt: new Date("2025-05-01T10:00:00Z") }
            ]
        });

        const result = await repo.getSensorsNetworkMeasurements(
            "networkCode1",
            ["33:33:33:33:33:33"],
            "2025-05-01T10:00:00Z",
            "2025-05-01T10:00:00Z"
        );

        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0].measurements.length).toBe(1);
        expect(result[0].measurements[0].value).toBe(25.5);

        mockGetSensorMeasurements.mockRestore();
    });

    it("getMeasurementsByNetworkAndSensors - just one date", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([
                { macAddress: "33:33:33:33:33:33", gateway: { macAddress: "11:11:11:11:11:11", network: { code: "networkCode1" } } }
            ]); // Sensors

        const mockGetSensorMeasurements = jest.spyOn(repo, "getSensorMeasurements").mockResolvedValue({
            sensorMacAddress: "33:33:33:33:33:33",
            measurements: [
                { value: 25.5, createdAt: new Date("2025-05-01T10:00:00Z") }
            ]
        });

        const result = await repo.getSensorsNetworkMeasurements(
            "networkCode1",
            ["33:33:33:33:33:33"],
            "2025-05-01T10:00:00Z",
            undefined
        );

        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0].measurements.length).toBe(1);
        expect(result[0].measurements[0].value).toBe(25.5);

        mockGetSensorMeasurements.mockRestore();
    });
    // Test per getSensorStats
    it("getSensorStats with startDate and endDate", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([{ macAddress: "11:11:11:11:11:11" }]) // Gateway exists
            .mockResolvedValueOnce([{ macAddress: "33:33:33:33:33:33" }]); // Sensor exists

        const measurement1 = new MeasurementDAO();
        measurement1.createdAt = new Date("2025-05-01T10:00:00Z");
        measurement1.value = 10;
        const measurement2 = new MeasurementDAO();
        measurement2.createdAt = new Date("2025-05-01T11:00:00Z");
        measurement2.value = 20;
        mockFind.mockResolvedValueOnce([measurement1, measurement2]);

        const stats = await repo.getSensorStats(
            "networkCode1",
            "11:11:11:11:11:11",
            "33:33:33:33:33:33",
            "2025-05-01T09:00:00Z",
            "2025-05-01T12:00:00Z"
        );

        expect(stats).toBeDefined();
        expect(stats.mean).toBe(15);
        expect(stats.variance).toBe(25);
        expect(stats.startDate).toEqual(new Date("2025-05-01T09:00:00.000Z"));
        expect(stats.endDate).toEqual(new Date("2025-05-01T12:00:00.000Z"));
        expect(mockFind).toHaveBeenCalled();
    });


    it("getSensorStats with only startDate", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([{ macAddress: "11:11:11:11:11:11" }]) // Gateway exists
            .mockResolvedValueOnce([{ macAddress: "33:33:33:33:33:33" }]); // Sensor exists

        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date("2025-05-01T10:00:00Z");
        measurement.value = 15;
        mockFind.mockResolvedValueOnce([measurement]);

        const stats = await repo.getSensorStats(
            "networkCode1",
            "11:11:11:11:11:11",
            "33:33:33:33:33:33",
            "2025-05-01T09:00:00Z",
            undefined
        );

        expect(stats).toBeDefined();
        expect(stats.mean).toBe(15);
        expect(mockFind).toHaveBeenCalled();
    });

    it("getSensorStats with only endDate", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([{ macAddress: "11:11:11:11:11:11" }]) // Gateway exists
            .mockResolvedValueOnce([{ macAddress: "33:33:33:33:33:33" }]); // Sensor exists

        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date("2025-05-01T10:00:00Z");
        measurement.value = 15;
        mockFind.mockResolvedValueOnce([measurement]);

        const stats = await repo.getSensorStats(
            "networkCode1",
            "11:11:11:11:11:11",
            "33:33:33:33:33:33",
            undefined,
            "2025-05-01T09:00:00Z",
        );

        expect(stats).toBeDefined();
        expect(stats.mean).toBe(15);
        expect(mockFind).toHaveBeenCalled();
    });

    // Test per getSensorsNetworkStats
    it("getSensorsNetworkStats with all sensors and no dates", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([
                { 
                    macAddress: "33:33:33:33:33:33",
                    gateway: {
                        macAddress: "11:11:11:11:11:11",
                        network: { code: "networkCode1" }
                    }
                }
            ]); // All sensors

        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date("2025-05-01T10:00:00Z");
        measurement.value = 15;
        mockFind.mockResolvedValueOnce([measurement]);

        const statsList = await repo.getSensorsNetworkStats(
            "networkCode1",
            [],
            undefined,
            undefined
        );

        expect(statsList).toBeDefined();
        expect(Array.isArray(statsList)).toBe(true);
        expect(statsList.length).toBe(1);
        expect(statsList[0].sensorMacAddress).toBe("33:33:33:33:33:33");
        expect(statsList[0].stats.mean).toBe(15);
        expect(mockFind).toHaveBeenCalled();
    });

    it("getSensorsNetworkStats with only endDate", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([{
                macAddress: "33:33:33:33:33:33",
                gateway: {
                    macAddress: "11:11:11:11:11:11",
                    network: { code: "networkCode1" }
                }
            }]); // All sensors

        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date("2025-05-01T10:00:00Z");
        measurement.value = 15;
        mockFind.mockResolvedValueOnce([measurement]);

        const statsList = await repo.getSensorsNetworkStats(
            "networkCode1",
            [],
            undefined,
            "2025-05-01T12:00:00Z"
        );

        expect(statsList).toBeDefined();
        expect(statsList.length).toBe(1);
        expect(statsList[0].stats.mean).toBe(15);
        expect(mockFind).toHaveBeenCalled();
    });

    it("getSensorsNetworkStats with empty sensor list", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([]); // No sensors found

        const statsList = await repo.getSensorsNetworkStats(
            "networkCode1",
            [],
            undefined,
            undefined
        );

        expect(statsList).toBeDefined();
        expect(statsList.length).toBe(0);
        expect(mockFind).toHaveBeenCalled();
    });

    // Test per getSensorOutliers
    it("getSensorOutliers with only startDate", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([{ macAddress: "11:11:11:11:11:11" }]) // Gateway exists
            .mockResolvedValueOnce([{ macAddress: "33:33:33:33:33:33" }]); // Sensor exists

        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date("2025-05-01T10:00:00Z");
        measurement.value = 15;
        mockFind.mockResolvedValueOnce([measurement]);

        const result = await repo.getSensorOutliers(
            "networkCode1",
            "11:11:11:11:11:11",
            "33:33:33:33:33:33",
            "2025-05-01T09:00:00Z",
            undefined
        );

        expect(result).toBeDefined();
        expect(result.sensorMacAddress).toBe("33:33:33:33:33:33");
        expect(Array.isArray(result.measurements)).toBe(true);
        expect(mockFind).toHaveBeenCalled();
    });

    it("getSensorOutliers with only endDate", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([{ macAddress: "11:11:11:11:11:11" }]) // Gateway exists
            .mockResolvedValueOnce([{ macAddress: "33:33:33:33:33:33" }]); // Sensor exists

        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date("2025-05-01T10:00:00Z");
        measurement.value = 15;
        mockFind.mockResolvedValueOnce([measurement]);

        const result = await repo.getSensorOutliers(
            "networkCode1",
            "11:11:11:11:11:11",
            "33:33:33:33:33:33",
            undefined,
            "2025-05-01T12:00:00Z"
        );

        expect(result).toBeDefined();
        expect(result.sensorMacAddress).toBe("33:33:33:33:33:33");
        expect(mockFind).toHaveBeenCalled();
    });

    it("getSensorsNetworkOutliers with only endDate", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([{
                macAddress: "33:33:33:33:33:33",
                gateway: {
                    macAddress: "11:11:11:11:11:11",
                    network: { code: "networkCode1" }
                }
            }]); // All sensors

        const mockGetSensorOutliers = jest.spyOn(repo, "getSensorOutliers").mockResolvedValue({
            sensorMacAddress: "33:33:33:33:33:33",
            measurements: [{ value: 100, createdAt: new Date("2025-05-01T10:00:00Z"), isOutlier: true }]
        });

        const result = await repo.getSensorsNetworkOutliers(
            "networkCode1",
            ["33:33:33:33:33:33"],
            undefined,
            "2025-05-01T12:00:00Z"
        );

        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(mockGetSensorOutliers).toHaveBeenCalledWith(
            "networkCode1",
            expect.any(String),
            "33:33:33:33:33:33",
            undefined,
            "2025-05-01T12:00:00Z"
        );

        mockGetSensorOutliers.mockRestore();
    });

    it("getSensorsNetworkOutliers with empty sensorMacs array", async () => {
        mockFind
            .mockResolvedValueOnce([{ code: "networkCode1" }]) // Network exists
            .mockResolvedValueOnce([]); // No sensors found

        const result = await repo.getSensorsNetworkOutliers(
            "networkCode1",
            [],
            undefined,
            undefined
        );

            expect(result).toBeDefined();
            expect(result).toEqual([]);
        });
    });
