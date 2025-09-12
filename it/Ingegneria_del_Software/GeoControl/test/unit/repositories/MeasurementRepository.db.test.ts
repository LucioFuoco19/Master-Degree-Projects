import {
    initializeTestDataSource,
    closeTestDataSource,
    TestDataSource
  } from "@test/setup/test-datasource";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import exp from "constants";
import { getGateway } from "@controllers/gatewayController";


const network = {
    networkCode: "networkCode1",
    networkName: "networkName",
    networkDescription: "networkDescription",
};

const gateway = {
    gatewayMac: "gatewayMac1",
    gatewayName: "gatewayName",
    gatewayDescription: "gatewayDescription",
}

const sensor = {
    sensorMac: "sensorMac1",
    sensorName: "sensorName",
    sensorDescription: "sensorDescription",
    sensorVariable: "sensorVariable",
    sensorUnit: "sensorUnit",
}


beforeAll(async () => {
    await initializeTestDataSource();
});

afterAll(async () => {
    await closeTestDataSource();
});


describe("MeasurementRepository: SQLite in-memory", () => {
    let networkRepo: NetworkRepository;
    let gatewayRepo: GatewayRepository;
    let sensorRepo: SensorRepository;
    let measurementRepo: MeasurementRepository;
    let networkDAO: NetworkDAO;
    let gatewayDAO: GatewayDAO;
    let sensorDAO: SensorDAO;

    const m = {
        createdAt: new Date("2023-05-01T12:00:00Z"),
        value: 10.0
    };
    const m1 = {
        createdAt: new Date("2023-06-01T12:00:00Z"),
        value: 14.0
    };

    beforeEach(async () => {
        await TestDataSource.getRepository(MeasurementDAO).clear();
        await TestDataSource.getRepository(SensorDAO).clear();
        await TestDataSource.getRepository(GatewayDAO).clear();
        await TestDataSource.getRepository(NetworkDAO).clear();

        // Create dependencies
        networkRepo = new NetworkRepository();
        networkDAO = await networkRepo.createNewNetwork(
            network.networkCode,
            network.networkName,
            network.networkDescription
        );

        gatewayRepo = new GatewayRepository();
        gatewayDAO = await gatewayRepo.createGateway(
            networkDAO.code,
            gateway.gatewayMac,
            gateway.gatewayName,
            gateway.gatewayDescription
        );

        sensorRepo = new SensorRepository();
        sensorDAO = await sensorRepo.createSensor(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            sensor.sensorName,
            sensor.sensorDescription,
            sensor.sensorVariable,
            sensor.sensorUnit
        );

        measurementRepo = new MeasurementRepository();
    });

    it("create measurement", async () => {
        const measurement = await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m.createdAt,
            m.value
        );
        const measurement1 = await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m1.createdAt,
            m1.value
        );
        expect(measurement).toMatchObject({
            value: 10.0,
            createdAt: m.createdAt
        });
        expect(measurement1).toMatchObject({
            value: 14.0,
            createdAt: m1.createdAt
        });

        const fetched = await measurementRepo.getSensorsNetworkMeasurements(
            networkDAO.code,
            [sensor.sensorMac],
            "2023-05-01T12:00:00Z",
            "2023-06-01T12:00:00Z"
        );
        expect(fetched.length).toBe(1);
        fetched.forEach(measurement => {
            expect(measurement.sensorMacAddress).toBe(sensor.sensorMac);
        });
    });

    it("get measurements with no filters (all optional)", async () => {
        await measurementRepo.createMeasurement(network.networkCode, gateway.gatewayMac, sensor.sensorMac, m.createdAt, m.value);
        await measurementRepo.createMeasurement(network.networkCode, gateway.gatewayMac, sensor.sensorMac, m1.createdAt, m1.value);

        const results = await measurementRepo.getSensorsNetworkMeasurements(networkDAO.code,undefined,undefined,undefined);

        expect(results.length).toBe(1);
        results.forEach(r => {
            expect(r.sensorMacAddress).toBe(sensor.sensorMac);
        });
    });

    it("get measurements with only sensorMacs filter", async () => {
        await measurementRepo.createMeasurement(network.networkCode, gateway.gatewayMac, sensor.sensorMac, m.createdAt, m.value);

        const results = await measurementRepo.getSensorsNetworkMeasurements(
            networkDAO.code,
            [sensor.sensorMac],
            undefined,
            undefined
        );

        expect(results.length).toBe(1);
        expect(results[0].sensorMacAddress).toBe(sensor.sensorMac);
    });

    it("get measurements with only startDate filter", async () => {
        await measurementRepo.createMeasurement(network.networkCode, gateway.gatewayMac, sensor.sensorMac, m.createdAt, m.value);
        await measurementRepo.createMeasurement(network.networkCode, gateway.gatewayMac, sensor.sensorMac, m1.createdAt, m1.value);

        const results = await measurementRepo.getSensorsNetworkMeasurements(
            networkDAO.code,
            undefined,
            "2023-06-01T00:00:00Z",
            undefined
        );

        expect(results.length).toBe(1);
        expect(results[0].measurements[0]).toMatchObject({
          createdAt: new Date("2023-06-01T12:00:00Z"),
          isOutlier: false,
          value: 14.0
        });
    });

    it("get measurements with only endDate filter", async () => {
        await measurementRepo.createMeasurement(network.networkCode, gateway.gatewayMac, sensor.sensorMac, m.createdAt, m.value);
        await measurementRepo.createMeasurement(network.networkCode, gateway.gatewayMac, sensor.sensorMac, m1.createdAt, m1.value);

        const results = await measurementRepo.getSensorsNetworkMeasurements(
            networkDAO.code,
            undefined,
            undefined,
            "2023-05-31T23:59:59Z"
        );

        expect(results.length).toBe(1);
        expect(results[0].measurements[0]).toMatchObject({
          createdAt: new Date("2023-05-01T12:00:00Z"),
          isOutlier: false,
          value: 10.0
        });
    });




    it("create measurement: sensor not found", async () => {
        await expect(measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            "ghostSensor",
            new Date("2025-05-01T12:00:00Z"),
            1
        )).rejects.toThrow(NotFoundError);
    });

    it("create measurement: gateway not found", async () => {
        await expect(measurementRepo.createMeasurement(
            network.networkCode,
            "ghostGateway",
            sensor.sensorMac,
            new Date("2025-05-01T12:00:00Z"),
            1
        )).rejects.toThrow(NotFoundError);
    });

    it("create measurement: network not found", async () => {
        await expect(measurementRepo.createMeasurement(
            "ghostNetwork",
            gateway.gatewayMac,
            sensor.sensorMac,
            new Date("2025-05-01T12:00:00Z"),
            1
        )).rejects.toThrow(NotFoundError);
    });

    it("get sensor stats with optional values", async () => {

        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m.createdAt,
            m.value
        );
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m1.createdAt,
            m1.value
        );

        const stats = await measurementRepo.getSensorStats(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            "2023-05-01T12:00:00Z",
            "2023-06-01T12:00:00Z"
        );

        expect(stats).toMatchObject({
            startDate: new Date("2023-05-01T12:00:00Z"),
            endDate: new Date("2023-06-01T12:00:00Z"),
            mean: expect.any(Number),
            variance: expect.any(Number),
            upperThreshold: expect.any(Number),
            lowerThreshold: expect.any(Number)
        });
    });

    it("get sensor stats with no startDate and no endDate", async () => {
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m.createdAt,
            m.value
        );
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m1.createdAt,
            m1.value
        );

        const stats = await measurementRepo.getSensorStats(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            undefined,
            undefined
        );

        expect(new Date(stats.startDate).toISOString()).toBe("1970-01-01T00:00:00.000Z");
        expect(new Date(stats.endDate).toISOString()).toBe(new Date().toISOString());
        expect(stats).toMatchObject({
            mean: expect.any(Number),
            variance: expect.any(Number),
            upperThreshold: expect.any(Number),
            lowerThreshold: expect.any(Number)
        });
    });

    it("get sensor stats without startDate", async () => {
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m.createdAt,
            m.value
        );
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m1.createdAt,
            m1.value
        );

        const stats = await measurementRepo.getSensorStats(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            undefined,
            "2023-06-01T12:00:00Z"
        );

        expect(new Date(stats.endDate).toISOString()).toBe("2023-06-01T12:00:00.000Z");
        expect(stats).toMatchObject({
            mean: expect.any(Number),
            variance: expect.any(Number),
            upperThreshold: expect.any(Number),
            lowerThreshold: expect.any(Number)
        });
    });

    it("get sensor stats without endDate", async () => {
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m.createdAt,
            m.value
        );
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m1.createdAt,
            m1.value
        );

        const stats = await measurementRepo.getSensorStats(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            "2023-05-01T12:00:00Z",
            undefined
        );

        expect(new Date(stats.startDate).toISOString()).toBe("2023-05-01T12:00:00.000Z");
        expect(stats).toMatchObject({
            mean: expect.any(Number),
            variance: expect.any(Number),
            upperThreshold: expect.any(Number),
            lowerThreshold: expect.any(Number)
        });
    });


    it("get outliers with both startDate and endDate", async () => {
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m.createdAt,
            100 
        );
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m1.createdAt,
            14.0 
        );

        const outliers = await measurementRepo.getSensorOutliers(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            "2023-05-01T12:00:00Z",
            "2023-06-01T12:00:00Z"
        );

        expect(outliers).toHaveProperty("sensorMacAddress");
        expect(outliers).toHaveProperty("stats");
        expect(outliers).toHaveProperty("measurements");
        expect(Array.isArray(outliers.measurements)).toBe(true);
        outliers.measurements.forEach(m => {
            expect(m).toHaveProperty("isOutlier");
        });
        outliers.measurements.forEach(m => {
            expect(m.isOutlier).toBe(true);
        });
    });

    it("get outliers with no dates", async () => {

        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m.createdAt,
            100 
        );
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m1.createdAt,
            14.0 
        );
        const outliers = await measurementRepo.getSensorOutliers(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            undefined,
            undefined
        );
        expect(outliers).toHaveProperty("sensorMacAddress");
        expect(outliers).toHaveProperty("stats");
        expect(outliers).toHaveProperty("measurements");
        expect(Array.isArray(outliers.measurements)).toBe(true);
        outliers.measurements.forEach(m => {
            expect(m.isOutlier).toBe(true);
        });

    });
       
    it("get outliers: network not found", async () => {
        await expect(
            measurementRepo.getSensorOutliers(
                "ghostNetwork",
                gateway.gatewayMac,
                sensor.sensorMac,
                undefined,
                undefined
            )
        ).rejects.toThrow(NotFoundError);
    });

    it("get outliers: gateway not found", async () => {
        await expect(
            measurementRepo.getSensorOutliers(
                network.networkCode,
                "ghostGateway",
                sensor.sensorMac,
                undefined,
                undefined
            )
        ).rejects.toThrow(
            NotFoundError
        );
    });

    it("get outliers: sensor not found", async () => {
        await expect(
            measurementRepo.getSensorOutliers(
                network.networkCode,
                gateway.gatewayMac,
                "ghostSensor",
                undefined,
                undefined
            )
        ).rejects.toThrow(
           NotFoundError
        );
    });

    it("get sensors network stats with only endDate and sensorMacs", async () => {
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m.createdAt,
            m.value
        );
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m1.createdAt,
            m1.value
        );

        const statsList = await measurementRepo.getSensorsNetworkStats(
            network.networkCode,
            [sensor.sensorMac],
            undefined,
            "2023-06-01T12:00:00Z"
        );
        expect(Array.isArray(statsList)).toBe(true);
        expect(statsList.length).toBeGreaterThan(0);
        expect(statsList[0]).toHaveProperty("sensorMacAddress", sensor.sensorMac);
    });

    it("get sensors network stats with only startDate and sensorMacs", async () => {
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m.createdAt,
            m.value
        );
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m1.createdAt,
            m1.value
        );

        const statsList = await measurementRepo.getSensorsNetworkStats(
            network.networkCode,
            [sensor.sensorMac],
            "2023-05-01T12:00:00Z",
            undefined
        );
        expect(Array.isArray(statsList)).toBe(true);
        expect(statsList.length).toBeGreaterThan(0);
        expect(statsList[0]).toHaveProperty("sensorMacAddress", sensor.sensorMac);
    });

    it("get sensors network stats with no dates and all sensors", async () => {
        const statsList = await measurementRepo.getSensorsNetworkStats(
            network.networkCode,
            [],
            undefined,
            undefined
        );
        expect(Array.isArray(statsList)).toBe(true);
        expect(statsList.length).toBeGreaterThan(0);

    });

    it("get sensors network stats: network not found", async () => {
        await expect(
            measurementRepo.getSensorsNetworkStats(
                "ghostNetwork",
                [],
                undefined,
                undefined
            )
        ).rejects.toThrow(NotFoundError);
    });

    it("get sensors network outliers with both dates and all sensors", async () => {

        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m.createdAt,
            100 
        );
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m1.createdAt,
            14.0 
        );

        const outliersList = await measurementRepo.getSensorsNetworkOutliers(
            network.networkCode,
            [],
            "2023-05-01T12:00:00Z",
            "2023-06-01T12:00:00Z"
        );

        expect(Array.isArray(outliersList)).toBe(true);
        expect(outliersList.length).toBe(1);
        const outliers = outliersList[0];
        expect(outliers.sensorMacAddress).toBe(sensor.sensorMac);
        expect(Array.isArray(outliers.measurements)).toBe(true);
    
        outliers.measurements.forEach(m => {
            expect(m.isOutlier).toBe(true);
        });
    });

    it("get measurements with inverted startDate and endDate (should return empty or handle gracefully)", async () => {
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m.createdAt,
            m.value
        );
        await measurementRepo.createMeasurement(
            network.networkCode,
            gateway.gatewayMac,
            sensor.sensorMac,
            m1.createdAt,
            m1.value
        );

        const results = await measurementRepo.getSensorsNetworkMeasurements(
            networkDAO.code,
            [sensor.sensorMac],
            "2023-06-02T00:00:00Z", // dopo la fine dei dati
            "2023-05-01T00:00:00Z"  // prima dell'inizio dei dati
        );

        expect(Array.isArray(results)).toBe(true);
        expect(results[0].measurements.length).toBe(0);
    });




});



