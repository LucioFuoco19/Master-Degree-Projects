import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS, TEST_GATEWAYS, TEST_SENSORS, TEST_MEASUREMENTS } from "@test/e2e/lifecycle";
import { Measurement } from "@models/dto/Measurement";
import { start } from "repl";

const BASE_URL = "/api/v1/networks/";

describe(" GET /networks/:networkCode/measurements" ,()=>{

    let token : string;
    const networkCode = TEST_NETWORKS.network1.code;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.viewer);
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it("Retrieve measurements for a set of sensors of a specific network (with sensors and dates null)" , async ()=>{ //case with no dates and list of sensors
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/measurements`)
            .set("Authorization", `Bearer ${token}`);
        
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2); 

        const response = res.body[0];
        if(res.body.length>0){
            expect(response).toHaveProperty("sensorMacAddress");
            expect(response).toHaveProperty("stats");
            expect(response).toHaveProperty("measurements");

            expect(response.stats).toHaveProperty("startDate");
            expect(response.stats).toHaveProperty("endDate");
            expect(response.stats).toHaveProperty("mean");
            expect(response.stats).toHaveProperty("variance");
            expect(response.stats).toHaveProperty("upperThreshold");
            expect(response.stats).toHaveProperty("lowerThreshold");

            response.measurements.forEach((m: any) => {
                expect(m).toHaveProperty("createdAt");
                expect(m).toHaveProperty("value");
                expect(m).toHaveProperty("isOutlier");
            });
            
        }
    });

    it("Retrieve measurements for a set of sensors of a specific network (pass only sensors)", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress,TEST_SENSORS.sensor2.macAddress];
        
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/measurements`)
            .query({
                sensorMacs : sensorMacs
            })
            .set("Authorization", `Bearer ${token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        const response = res.body[0];
        if(res.body.length>0){
            expect(response).toHaveProperty("sensorMacAddress");
            expect(response).toHaveProperty("stats");
            expect(response).toHaveProperty("measurements");

            expect(response.stats).toHaveProperty("startDate");
            expect(response.stats).toHaveProperty("endDate");
            expect(response.stats).toHaveProperty("mean");
            expect(response.stats).toHaveProperty("variance");
            expect(response.stats).toHaveProperty("upperThreshold");
            expect(response.stats).toHaveProperty("lowerThreshold");

            response.measurements.forEach((m: any) => {
                expect(m).toHaveProperty("createdAt");
                expect(m).toHaveProperty("value");
                expect(m).toHaveProperty("isOutlier");
            });
            
        }
    });
    it("Retrieve measurements with only startDate", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress, TEST_SENSORS.sensor2.macAddress];
        const startDate = "2025-02-18T00:00:00+01:00";

        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/measurements`)
            .query({ sensorMacs : sensorMacs,
                     startDate : new Date(startDate) })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        res.body.forEach((response: any) => {
            expect(response).toHaveProperty("sensorMacAddress");
            expect(response).toHaveProperty("stats");
            expect(response).toHaveProperty("measurements");

            expect(response.stats).toHaveProperty("startDate");
            expect(response.stats).toHaveProperty("endDate");
            expect(response.stats).toHaveProperty("mean");
            expect(response.stats).toHaveProperty("variance");
            expect(response.stats).toHaveProperty("upperThreshold");
            expect(response.stats).toHaveProperty("lowerThreshold");

            response.measurements.forEach((m: Measurement) => {
                expect(m).toHaveProperty("createdAt");
                expect(m).toHaveProperty("value");
                expect(m).toHaveProperty("isOutlier");
            });
        });
    });

    it("Retrieve measurements with only endDate", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress, TEST_SENSORS.sensor2.macAddress];
        const endDate = "2025-02-18T23:59:59+01:00";

        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/measurements`)
            .query({ sensorMacs : sensorMacs,
                     endDate : new Date(endDate)})
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        res.body.forEach((response: any) => {
            expect(response).toHaveProperty("sensorMacAddress");
            expect(response).toHaveProperty("stats");
            expect(response).toHaveProperty("measurements");

            expect(response.stats).toHaveProperty("startDate");
            expect(response.stats).toHaveProperty("endDate");
            expect(response.stats).toHaveProperty("mean");
            expect(response.stats).toHaveProperty("variance");
            expect(response.stats).toHaveProperty("upperThreshold");
            expect(response.stats).toHaveProperty("lowerThreshold");

            response.measurements.forEach((m: Measurement) => {
                expect(m).toHaveProperty("createdAt");
                expect(m).toHaveProperty("value");
                expect(m).toHaveProperty("isOutlier");
            });
        });
    });

    it("Retrieve measurements with startDate,endDate and sensors", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress, TEST_SENSORS.sensor2.macAddress];
        const startDate = "2025-02-18T00:00:00+01:00";
        const endDate = "2025-02-18T23:59:59+01:00";

        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/measurements`)
            .query({ sensorMacs : sensorMacs,
                     startDate : new Date(startDate),
                     endDate : new Date(endDate) })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        res.body.forEach((response: any) => {
            expect(response).toHaveProperty("sensorMacAddress");
            expect(response).toHaveProperty("stats");
            expect(response).toHaveProperty("measurements");

            expect(response.stats).toHaveProperty("startDate");
            expect(response.stats).toHaveProperty("endDate");
            expect(response.stats).toHaveProperty("mean");
            expect(response.stats).toHaveProperty("variance");
            expect(response.stats).toHaveProperty("upperThreshold");
            expect(response.stats).toHaveProperty("lowerThreshold");

            response.measurements.forEach((m: any) => {
                expect(m).toHaveProperty("createdAt");
                expect(m).toHaveProperty("value");
                expect(m).toHaveProperty("isOutlier");
            });
        });
    });



        
    it("return 400 for invalid startDate format", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/measurements`)
            .query({
                startDate : "24/12/2002"
            })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("code",400);
        expect(res.body).toHaveProperty("name", "BadRequest");
        expect(res.body).toHaveProperty("message", expect.stringContaining("startDate"));
    });


    it("return 401 for missing token", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/measurements`);

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("code",401);
        expect(res.body).toHaveProperty("name", "UnauthorizedError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent network", async () => {
        const res = await request(app)
            .get(`${BASE_URL}nonexistent-network/measurements`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code",404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

});


describe(" GET /networks/:networkCode/stats",()=>{
    let token : string;
    const networkCode = TEST_NETWORKS.network1.code;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.viewer);
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it("Retrieve only statistics for a set of sensors of a specified network (with sensors and dates null)", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/stats`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        const response = res.body[0];
        expect(response).toHaveProperty("sensorMacAddress");
        expect(response).toHaveProperty("stats");

        expect(response.stats).toHaveProperty("startDate");
        expect(response.stats).toHaveProperty("endDate");
        expect(response.stats).toHaveProperty("mean");
        expect(response.stats).toHaveProperty("variance");
        expect(response.stats).toHaveProperty("upperThreshold");
        expect(response.stats).toHaveProperty("lowerThreshold");
    });

      it("Retrieve measurements for a set of sensors of a specific network (pass only sensors)", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress,TEST_SENSORS.sensor2.macAddress];
        
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/measurements`)
            .query({
                sensorMacs : sensorMacs
            })
            .set("Authorization", `Bearer ${token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        const response = res.body[0];
        if(res.body.length>0){
            const response = res.body[0];
            expect(response).toHaveProperty("sensorMacAddress");
            expect(response).toHaveProperty("stats");

            expect(response.stats).toHaveProperty("startDate");
            expect(response.stats).toHaveProperty("endDate");
            expect(response.stats).toHaveProperty("mean");
            expect(response.stats).toHaveProperty("variance");
            expect(response.stats).toHaveProperty("upperThreshold");
            expect(response.stats).toHaveProperty("lowerThreshold");
            
        }
    });
    it("Retrieve measurements with only startDate", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress, TEST_SENSORS.sensor2.macAddress];
        const startDate = "2025-02-18T00:00:00+01:00";

        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/measurements`)
            .query({ sensorMacs : sensorMacs,
                     startDate : new Date(startDate) })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        const response = res.body[0];
        expect(response).toHaveProperty("sensorMacAddress");
        expect(response).toHaveProperty("stats");

        expect(response.stats).toHaveProperty("startDate");
        expect(response.stats).toHaveProperty("endDate");
        expect(response.stats).toHaveProperty("mean");
        expect(response.stats).toHaveProperty("variance");
        expect(response.stats).toHaveProperty("upperThreshold");
        expect(response.stats).toHaveProperty("lowerThreshold");
    });

    it("Retrieve measurements with only endDate", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress, TEST_SENSORS.sensor2.macAddress];
        const endDate = "2025-02-18T23:59:59+01:00";

        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/measurements`)
            .query({ sensorMacs : sensorMacs,
                     endDate : new Date(endDate)})
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        const response = res.body[0];
        expect(response).toHaveProperty("sensorMacAddress");
        expect(response).toHaveProperty("stats");

        expect(response.stats).toHaveProperty("startDate");
        expect(response.stats).toHaveProperty("endDate");
        expect(response.stats).toHaveProperty("mean");
        expect(response.stats).toHaveProperty("variance");
        expect(response.stats).toHaveProperty("upperThreshold");
        expect(response.stats).toHaveProperty("lowerThreshold");
    });

    it("Retrieve measurements with startDate,endDate and sensors", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress, TEST_SENSORS.sensor2.macAddress];
        const startDate = "2025-02-18T00:00:00+01:00";
        const endDate = "2025-02-18T23:59:59+01:00";

        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/measurements`)
            .query({ sensorMacs : sensorMacs,
                     startDate : new Date(startDate),
                     endDate : new Date(endDate) })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        const response = res.body[0];
        expect(response).toHaveProperty("sensorMacAddress");
        expect(response).toHaveProperty("stats");

        expect(response.stats).toHaveProperty("startDate");
        expect(response.stats).toHaveProperty("endDate");
        expect(response.stats).toHaveProperty("mean");
        expect(response.stats).toHaveProperty("variance");
        expect(response.stats).toHaveProperty("upperThreshold");
        expect(response.stats).toHaveProperty("lowerThreshold");
    });

    it("return 400 for invalid startDate format", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/stats`)
            .query({
                startDate : "24/12/1992"
            })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("code", 400);
        expect(res.body).toHaveProperty("name", "BadRequest");
        expect(res.body).toHaveProperty("message", expect.stringContaining("startDate"));
    });

    it("return 401 for missing token", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/stats`);

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("code", 401);
        expect(res.body).toHaveProperty("name", "UnauthorizedError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent network", async () => {
        const res = await request(app)
            .get(`${BASE_URL}nonexistent-network/stats`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

});

describe(" GET /networks/:networkCode/outliers",()=>{
    let token : string;
    const networkCode = TEST_NETWORKS.network1.code;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.viewer);
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it("Retrieve only outliers measurements for a set of sensors of a specific network (with sensors and dates null)" , async ()=>{ //case with no dates and list of sensors
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/outliers`)
            .set("Authorization", `Bearer ${token}`);
        
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2); 

        const response = res.body[0];
        if(res.body.length>0){
            expect(response).toHaveProperty("sensorMacAddress");
            expect(response).toHaveProperty("stats");
            expect(response).toHaveProperty("measurements");

            expect(response.stats).toHaveProperty("startDate");
            expect(response.stats).toHaveProperty("endDate");
            expect(response.stats).toHaveProperty("mean");
            expect(response.stats).toHaveProperty("variance");
            expect(response.stats).toHaveProperty("upperThreshold");
            expect(response.stats).toHaveProperty("lowerThreshold");

            response.measurements.forEach((m: any) => {
                expect(m).toHaveProperty("createdAt");
                expect(m).toHaveProperty("value");
                expect(m).toHaveProperty("isOutlier");
            });
            
        }
    });

    it("Retrieve only outliers measurements for a set of sensors of a specific network (pass only sensors)", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress,TEST_SENSORS.sensor2.macAddress];
        
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/outliers`)
            .query({
                sensorMacs : sensorMacs
            })
            .set("Authorization", `Bearer ${token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        const response = res.body[0];
        if(res.body.length>0){
            expect(response).toHaveProperty("sensorMacAddress");
            expect(response).toHaveProperty("stats");
            expect(response).toHaveProperty("measurements");

            expect(response.stats).toHaveProperty("startDate");
            expect(response.stats).toHaveProperty("endDate");
            expect(response.stats).toHaveProperty("mean");
            expect(response.stats).toHaveProperty("variance");
            expect(response.stats).toHaveProperty("upperThreshold");
            expect(response.stats).toHaveProperty("lowerThreshold");

            response.measurements.forEach((m: any) => {
                expect(m).toHaveProperty("createdAt");
                expect(m).toHaveProperty("value");
                expect(m).toHaveProperty("isOutlier");
            });
            
        }
    });
    it("Retrieve only outliers measurements with only startDate", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress, TEST_SENSORS.sensor2.macAddress];
        const startDate = "2025-02-18T00:00:00+01:00";

        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/outliers`)
            .query({ sensorMacs : sensorMacs,
                     startDate : new Date(startDate) })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        res.body.forEach((response: any) => {
            expect(response).toHaveProperty("sensorMacAddress");
            expect(response).toHaveProperty("stats");
            expect(response).toHaveProperty("measurements");

            expect(response.stats).toHaveProperty("startDate");
            expect(response.stats).toHaveProperty("endDate");
            expect(response.stats).toHaveProperty("mean");
            expect(response.stats).toHaveProperty("variance");
            expect(response.stats).toHaveProperty("upperThreshold");
            expect(response.stats).toHaveProperty("lowerThreshold");

            response.measurements.forEach((m: Measurement) => {
                expect(m).toHaveProperty("createdAt");
                expect(m).toHaveProperty("value");
                expect(m).toHaveProperty("isOutlier");
            });
        });
    });

    it("Retrieve only outliers measurements with only endDate", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress, TEST_SENSORS.sensor2.macAddress];
        const endDate = "2025-02-18T23:59:59+01:00";

        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/outliers`)
            .query({ sensorMacs : sensorMacs,
                     endDate : new Date(endDate)})
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        res.body.forEach((response: any) => {
            expect(response).toHaveProperty("sensorMacAddress");
            expect(response).toHaveProperty("stats");
            expect(response).toHaveProperty("measurements");

            expect(response.stats).toHaveProperty("startDate");
            expect(response.stats).toHaveProperty("endDate");
            expect(response.stats).toHaveProperty("mean");
            expect(response.stats).toHaveProperty("variance");
            expect(response.stats).toHaveProperty("upperThreshold");
            expect(response.stats).toHaveProperty("lowerThreshold");

            response.measurements.forEach((m: Measurement) => {
                expect(m).toHaveProperty("createdAt");
                expect(m).toHaveProperty("value");
                expect(m).toHaveProperty("isOutlier");
            });
        });
    });

    it("Retrieve only outliers measurements with startDate,endDate and sensors", async () => {
        const sensorMacs = [TEST_SENSORS.sensor1.macAddress, TEST_SENSORS.sensor2.macAddress];
        const startDate = "2025-02-18T00:00:00+01:00";
        const endDate = "2025-02-18T23:59:59+01:00";

        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/outliers`)
            .query({ sensorMacs : sensorMacs,
                     startDate : new Date(startDate),
                     endDate : new Date(endDate) })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        res.body.forEach((response: any) => {
            expect(response).toHaveProperty("sensorMacAddress");
            expect(response).toHaveProperty("stats");
            expect(response).toHaveProperty("measurements");

            expect(response.stats).toHaveProperty("startDate");
            expect(response.stats).toHaveProperty("endDate");
            expect(response.stats).toHaveProperty("mean");
            expect(response.stats).toHaveProperty("variance");
            expect(response.stats).toHaveProperty("upperThreshold");
            expect(response.stats).toHaveProperty("lowerThreshold");

            response.measurements.forEach((m: any) => {
                expect(m).toHaveProperty("createdAt");
                expect(m).toHaveProperty("value");
                expect(m).toHaveProperty("isOutlier");
            });
        });
    });

    it("return 400 for invalid startDate format", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/stats`)
            .query({
                startDate : "24/12/1992"
            })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("code", 400);
        expect(res.body).toHaveProperty("name", "BadRequest");
        expect(res.body).toHaveProperty("message", expect.stringContaining("startDate"));
    });

    it("return 401 for missing token", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/stats`);

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("code", 401);
        expect(res.body).toHaveProperty("name", "UnauthorizedError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent network", async () => {
        const res = await request(app)
            .get(`${BASE_URL}nonexistent-network/stats`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

});

describe (" POST /networks/:networkCode/gateways/:gatewayMac/sensors/:sensorsMac/measurements",()=>{

    let token : string;
    let tokenOperator : string;
    const networkCode = TEST_NETWORKS.network1.code;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.admin);
        tokenOperator = generateToken(TEST_USERS.operator)
    });

    afterAll(async () => {
        await afterAllE2e();
    });


    it("Store measurement for a sensor ",async ()=>{
        const m5=  {
            createdAt: new Date("2025-02-19T18:00:00Z"),
            value: 70.85
        };
        const m6 ={
            createdAt: new Date("2025-02-19T18:00:00Z"),
            value: 70.85
        }
        const res = await request(app)
            .post(`${BASE_URL}${networkCode}/gateways/${TEST_GATEWAYS.gateway1.macAddress}/sensors/${TEST_SENSORS.sensor1.macAddress}/measurements`)
            .send([m5,m6])
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(201);        
    });

    it("Store measurement for a sensor as an operator ",async ()=>{
        const m7=  {
            createdAt: new Date("2025-10-19T18:00:00Z"),
            value: 90.85
        };
        const m8 ={
            createdAt: new Date("2025-09-19T18:00:00Z"),
            value: 71.85
        }
        const res = await request(app)
            .post(`${BASE_URL}${networkCode}/gateways/${TEST_GATEWAYS.gateway1.macAddress}/sensors/${TEST_SENSORS.sensor2.macAddress}/measurements`)
            .send([m7,m8])
            .set("Authorization", `Bearer ${tokenOperator}`);

        expect(res.status).toBe(201);        
    });

    it("return 400 for missing required property", async () => {
    const invalidMeasurement = [{ 
        createdAt: new Date("2025-02-19T18:00:00Z")
    }];
    const res = await request(app)
        .post(`${BASE_URL}${networkCode}/gateways/${TEST_GATEWAYS.gateway1.macAddress}/sensors/${TEST_SENSORS.sensor1.macAddress}/measurements`)
        .send(invalidMeasurement)
        .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("code", 400);
    expect(res.body).toHaveProperty("name", "BadRequest");
    expect(res.body).toHaveProperty("message", expect.stringContaining("must have required property"));
    });

    it("return 401 for missing token", async () => {
        const m = { 
            createdAt: new Date("2025-02-19T18:00:00Z"), value: 70.85 
        };
        const res = await request(app)
            .post(`${BASE_URL}${networkCode}/gateways/${TEST_GATEWAYS.gateway1.macAddress}/sensors/${TEST_SENSORS.sensor1.macAddress}/measurements`)
            .send([m]);

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("code", 401);
        expect(res.body).toHaveProperty("name", "UnauthorizedError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 403 for insufficient rights", async () => {
        const viewerToken = generateToken(TEST_USERS.viewer);
        const m = { createdAt: new Date("2025-02-19T18:00:00Z"), value: 70.85 };
        const res = await request(app)
            .post(`${BASE_URL}${networkCode}/gateways/${TEST_GATEWAYS.gateway1.macAddress}/sensors/${TEST_SENSORS.sensor1.macAddress}/measurements`)
            .send([m])
            .set("Authorization", `Bearer ${viewerToken}`);

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty("code", 403);
        expect(res.body).toHaveProperty("name", "InsufficientRightsError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent network", async () => {
        const m = { createdAt: new Date("2025-02-19T18:00:00Z"), value: 70.85 };
        const res = await request(app)
            .post(`${BASE_URL}nonexistent-network/gateways/${TEST_GATEWAYS.gateway1.macAddress}/sensors/${TEST_SENSORS.sensor1.macAddress}/measurements`)
            .send([m])
            .set("Authorization", `Bearer ${token}`);
        
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent gateway", async () => {
        const m = { createdAt: new Date("2025-02-19T18:00:00Z"), value: 70.85 };
        const res = await request(app)
            .post(`${BASE_URL}${networkCode}/gateways/00:00:00:00:00:00/sensors/${TEST_SENSORS.sensor1.macAddress}/measurements`)
            .send([m])
            .set("Authorization", `Bearer ${token}`);
        
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent sensor", async () => {
        const m = { createdAt: new Date("2025-02-19T18:00:00Z"), value: 70.85 };
        const res = await request(app)
            .post(`${BASE_URL}${networkCode}/gateways/${TEST_GATEWAYS.gateway1.macAddress}/sensors/00:00:00:00:00:00/measurements`)
            .send([m])
            .set("Authorization", `Bearer ${token}`);
        
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

});

describe("GET /networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements", () => {
    let token: string;
    const networkCode = TEST_NETWORKS.network1.code;
    const gatewayMac = TEST_GATEWAYS.gateway1.macAddress;
    const sensorMac = TEST_SENSORS.sensor1.macAddress;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.viewer);
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it("retrieve measurements for a specific sensor", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("sensorMacAddress");
        expect(res.body).toHaveProperty("stats");
        expect(res.body).toHaveProperty("measurements");

        expect(res.body.stats).toHaveProperty("startDate");
        expect(res.body.stats).toHaveProperty("endDate");
        expect(res.body.stats).toHaveProperty("mean");
        expect(res.body.stats).toHaveProperty("variance");
        expect(res.body.stats).toHaveProperty("upperThreshold");
        expect(res.body.stats).toHaveProperty("lowerThreshold");

        if (res.body.measurements.length > 0) {
            const m = res.body.measurements[0];
            expect(m).toHaveProperty("createdAt");
            expect(m).toHaveProperty("value");
            expect(m).toHaveProperty("isOutlier");
        }
    });

    it("retrieve measurements for a specific sensor with dates", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
            .query({
                startDate : new Date("2025-02-18T16:00:00.000Z"),
                endDate : new Date("2025-02-18T17:00:00.000Z")
            })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("sensorMacAddress");
        expect(res.body).toHaveProperty("stats");
        expect(res.body).toHaveProperty("measurements");

        expect(res.body.stats).toHaveProperty("startDate");
        expect(res.body.stats).toHaveProperty("endDate");
        expect(res.body.stats).toHaveProperty("mean");
        expect(res.body.stats).toHaveProperty("variance");
        expect(res.body.stats).toHaveProperty("upperThreshold");
        expect(res.body.stats).toHaveProperty("lowerThreshold");

        if (res.body.measurements.length > 0) {
            const m = res.body.measurements[0];
            expect(m).toHaveProperty("createdAt");
            expect(m).toHaveProperty("value");
            expect(m).toHaveProperty("isOutlier");
        }
    });



    it("return 400 for invalid startDate format", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
            .query({ startDate: "24/12/1992" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("code", 400);
        expect(res.body).toHaveProperty("name", "BadRequest");
        expect(res.body).toHaveProperty("message", expect.stringContaining("startDate"));
    });

    it("return 401 for missing token", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`);

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("code", 401);
        expect(res.body).toHaveProperty("name", "UnauthorizedError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent network", async () => {
        const res = await request(app)
            .get(`${BASE_URL}nonexistent-network/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent gateway", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/00:00:00:00:00:00/sensors/${sensorMac}/measurements`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent sensor", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/00:00:00:00:00:00/measurements`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });
});

describe("GET /networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/stats", () => {
    let token: string;
    const networkCode = TEST_NETWORKS.network1.code;
    const gatewayMac = TEST_GATEWAYS.gateway1.macAddress;
    const sensorMac = TEST_SENSORS.sensor1.macAddress;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.viewer);
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it("return 200 and statistics for a specific sensor", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("startDate");
        expect(res.body).toHaveProperty("endDate");
        expect(res.body).toHaveProperty("mean");
        expect(res.body).toHaveProperty("variance");
        expect(res.body).toHaveProperty("upperThreshold");
        expect(res.body).toHaveProperty("lowerThreshold");
    });

    it("return 200 and statistics for a specific sensor with startDate and endDate", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`)
            .query({
                startDate: new Date("2025-02-18T16:00:00.000Z"),
                endDate: new Date("2025-02-18T17:00:00.000Z")
            })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("startDate");
        expect(res.body).toHaveProperty("endDate");
        expect(res.body).toHaveProperty("mean");
        expect(res.body).toHaveProperty("variance");
        expect(res.body).toHaveProperty("upperThreshold");
        expect(res.body).toHaveProperty("lowerThreshold");
    });

    it("return 400 for invalid startDate format", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`)
            .query({ startDate: "24/12/1992" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("code", 400);
        expect(res.body).toHaveProperty("name", "BadRequest");
        expect(res.body).toHaveProperty("message", expect.stringContaining("startDate"));
    });

    it("return 401 for missing token", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`);

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("code", 401);
        expect(res.body).toHaveProperty("name", "UnauthorizedError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent network", async () => {
        const res = await request(app)
            .get(`${BASE_URL}nonexistent-network/gateways/${gatewayMac}/sensors/${sensorMac}/stats`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent gateway", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/00:00:00:00:00:00/sensors/${sensorMac}/stats`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent sensor", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/00:00:00:00:00:00/stats`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });
});

describe("GET /networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/outliers", () => {
    let token: string;
    const networkCode = TEST_NETWORKS.network1.code;
    const gatewayMac = TEST_GATEWAYS.gateway1.macAddress;
    const sensorMac = TEST_SENSORS.sensor1.macAddress;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.viewer);
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it("return 200 and only outlier measurements for a specific sensor", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("sensorMacAddress");
        expect(res.body).toHaveProperty("stats");
        expect(res.body).toHaveProperty("measurements");


        expect(res.body.stats).toHaveProperty("startDate");
        expect(res.body.stats).toHaveProperty("endDate");
        expect(res.body.stats).toHaveProperty("mean");
        expect(res.body.stats).toHaveProperty("variance");
        expect(res.body.stats).toHaveProperty("upperThreshold");
        expect(res.body.stats).toHaveProperty("lowerThreshold");

        if (res.body.measurements.length > 0) {
            const m = res.body.measurements[0];
            expect(m).toHaveProperty("createdAt");
            expect(m).toHaveProperty("value");
            expect(m).toHaveProperty("isOutlier", true);
        }
    });

    it("return 200 and only outlier measurements for a specific sensor with dates", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`)
            .query({
                startDate: new Date("2025-02-18T16:00:00.000Z"),
                endDate: new Date("2025-02-18T17:00:00.000Z")
            })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("sensorMacAddress");
        expect(res.body).toHaveProperty("stats");
        expect(res.body).toHaveProperty("measurements");

        expect(res.body.stats).toHaveProperty("startDate");
        expect(res.body.stats).toHaveProperty("endDate");
        expect(res.body.stats).toHaveProperty("mean");
        expect(res.body.stats).toHaveProperty("variance");
        expect(res.body.stats).toHaveProperty("upperThreshold");
        expect(res.body.stats).toHaveProperty("lowerThreshold");
    });

    it("return 400 for invalid startDate format", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`)
            .query({ startDate: "24/12/1992" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("code", 400);
        expect(res.body).toHaveProperty("name", "BadRequest");
        expect(res.body).toHaveProperty("message", expect.stringContaining("startDate"));
    });

    it("return 401 for missing token", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`);

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("code", 401);
        expect(res.body).toHaveProperty("name", "UnauthorizedError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent network", async () => {
        const res = await request(app)
            .get(`${BASE_URL}nonexistent-network/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent gateway", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/00:00:00:00:00:00/sensors/${sensorMac}/outliers`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });

    it("return 404 for non-existent sensor", async () => {
        const res = await request(app)
            .get(`${BASE_URL}${networkCode}/gateways/${gatewayMac}/sensors/00:00:00:00:00:00/outliers`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "NotFoundError");
        expect(res.body).toHaveProperty("message");
    });
});






