import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS, TEST_GATEWAYS, TEST_SENSORS } from "@test/e2e/lifecycle";

describe("GET /networks/:networkCode/gateways/:gatewayMac/sensors (e2e)", () => {
  let token: string;

  const networkCode = TEST_NETWORKS.network1.code;
  const gatewayMac = TEST_GATEWAYS.gateway1.macAddress;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("retrieves all sensors of a gateway", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);    

    if (res.body.length > 0) {
      const sensor = res.body[0];
      expect(sensor).toHaveProperty("macAddress");
      expect(sensor).toHaveProperty("name");
      expect(sensor).toHaveProperty("description");
      expect(sensor).toHaveProperty("variable");
      expect(sensor).toHaveProperty("unit");
    }
  });

  it("returns 401 if no token is provided", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        code: 401,
        name: "UnauthorizedError",
      })
    );
  });

  it("returns 404 if the network or gateway does not exist", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/invalid-network/gateways/invalid-gateway/sensors`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual(
      expect.objectContaining({
        code: 404,
        name: "NotFoundError",
      })
    );
  });
});

describe("POST /networks/:networkCode/gateways/:gatewayMac/sensors (e2e)", () => {
  let adminToken: string;
  let operatorToken: string;
  let viewerToken: string;

  const networkCode = TEST_NETWORKS.network1.code;
  const gatewayMac = TEST_GATEWAYS.gateway1.macAddress;

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("creates a sensor as admin", async () => {
    const payload = {
      macAddress: "00:11:22:33:44:66",
      name: "New Sensor",
      description: "External thermometer",
      variable: "temperature",
      unit: "C"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
  });

  it("creates a sensor as operator", async () => {
    const payload = {
      macAddress: "00:11:22:33:44:77",
      name: "Operator Sensor",
      description: "Created by operator",
      variable: "humidity",
      unit: "%"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(payload);

    expect(res.status).toBe(201);
  });

  it("returns 400 for invalid input (missing macAddress)", async () => {
    const invalidPayload = {
      macAddress: "",  
      name: "Invalid Sensor",
      description: "Missing MAC",
      variable: "temperature",
      unit: "C"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({
      code: 400,
      name: "BadRequest"
    }));
  });

  it("returns 401 if no token is provided", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .send(TEST_SENSORS.sensor1);

    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({
      code: 401,
      name: "UnauthorizedError"
    }));
  });

  it("returns 403 if user has insufficient rights (viewer)", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({
        ...TEST_SENSORS.sensor1,
        macAddress: "00:00:00:00:00:01"
      });

    expect(res.status).toBe(403);
    expect(res.body).toEqual(expect.objectContaining({
      code: 403,
      name: "InsufficientRightsError"
    }));
  });

  it("returns 404 if network or gateway doesn't exist", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/invalid-network/gateways/invalid-gateway/sensors`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(TEST_SENSORS.sensor1);

    expect(res.status).toBe(404);
    expect(res.body).toEqual(expect.objectContaining({
      code: 404,
      name: "NotFoundError"
    }));
  });

  it("returns 409 if sensor with same MAC already exists", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(TEST_SENSORS.sensor1); // already inserted by lifecycle

    expect(res.status).toBe(409);
    expect(res.body).toEqual(expect.objectContaining({
      code: 409,
      name: "ConflictError"
    }));
  });
});

describe("GET /networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac (e2e)", () => {

    let token: string;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.viewer);
      });
    
      afterAll(async () => {
        await afterAllE2e();
      });

    it("retrieves a sensor by its MAC address", async () => {
      const res = await request(app)
        .get(`/api/v1/networks/${TEST_NETWORKS.network1.code}/gateways/${TEST_GATEWAYS.gateway1.macAddress}/sensors/${TEST_SENSORS.sensor1.macAddress}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          macAddress: TEST_SENSORS.sensor1.macAddress,
          name: TEST_SENSORS.sensor1.name,
          description: TEST_SENSORS.sensor1.description,
          variable: TEST_SENSORS.sensor1.variable,
          unit: TEST_SENSORS.sensor1.unit
        })
      );
    });

    it("return 401 if no token is provided", async () => {
        const res = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network1.code}/gateways/${TEST_GATEWAYS.gateway1.macAddress}/sensors/${TEST_SENSORS.sensor1.macAddress}`);
    
        expect(res.status).toBe(401);
        expect(res.body).toEqual(
            expect.objectContaining({
            code: 401,
            name: "UnauthorizedError",
            })
        );
    });

    it("returns 404 if the sensor does not exist", async () => {
        const res = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network1.code}/gateways/${TEST_GATEWAYS.gateway1.macAddress}/sensors/invalid-sensor`)
            .set("Authorization", `Bearer ${token}`);
    
        expect(res.status).toBe(404);
        expect(res.body).toEqual(
            expect.objectContaining({
            code: 404,
            name: "NotFoundError",
            })
        );
    });

    it("returns 404 if the network or gateway does not exist", async () => {
        const res = await request(app)
            .get(`/api/v1/networks/invalid-network/gateways/invalid-gateway/sensors/invalid-sensor`)
            .set("Authorization", `Bearer ${token}`);
    
        expect(res.status).toBe(404);
        expect(res.body).toEqual(
            expect.objectContaining({
            code: 404,
            name: "NotFoundError",
            })
        );
    });
});

describe("PATCH /networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac (e2e)", () => {

    let adminToken: string;
    let operatorToken: string;
    let viewerToken: string;
  
    const networkCode = TEST_NETWORKS.network1.code;
    const gatewayMac = TEST_GATEWAYS.gateway1.macAddress;
  
    beforeAll(async () => {
      await beforeAllE2e();
      adminToken = generateToken(TEST_USERS.admin);
      operatorToken = generateToken(TEST_USERS.operator);
      viewerToken = generateToken(TEST_USERS.viewer);
    });
  
    afterAll(async () => {
      await afterAllE2e();
    });

    it("updates a sensor as admin", async () => {
        const payload = {
            name: "Updated Sensor",
            description: "Updated description",
            variable: "humidity",
            unit: "%"
        };

        const res = await request(app)
            .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${TEST_SENSORS.sensor1.macAddress}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send(payload);

        expect(res.status).toBe(204);
    });

    it("updates a sensor as operator", async () => {
        const payload = {
            name: "Operator Sensor",
            description: "Updated by operator",
            variable: "temperature",
            unit: "C"
        };

        const res = await request(app)
            .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${TEST_SENSORS.sensor1.macAddress}`)
            .set("Authorization", `Bearer ${operatorToken}`)
            .send(payload);

        expect(res.status).toBe(204);
    });

    it("returns 403 if user has insufficient rights (viewer)", async () => {
        const res = await request(app)
            .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${TEST_SENSORS.sensor1.macAddress}`)
            .set("Authorization", `Bearer ${viewerToken}`)
            .send({
                name: "Invalid Sensor",
                description: "Invalid update",
                variable: "temperature",
                unit: "C"
            });

        expect(res.status).toBe(403);
        expect(res.body).toEqual(expect.objectContaining({
            code: 403,
            name: "InsufficientRightsError"
        }));
    });

    it("returns 400 for invalid input (missing mac address)", async () => {
        const invalidPayload = {
            macAddress: "",
            name: "Updated Name",
            description: "Updated Description"
        };

        const res = await request(app)
            .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${TEST_SENSORS.sensor1.macAddress}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send(invalidPayload);

        expect(res.status).toBe(400);
        expect(res.body).toEqual(expect.objectContaining({
            code: 400,
            name: "BadRequest"
        }));
    });

    it("returns 409 if updating sensor MAC to an existing MAC", async () => {
        // sensor2 esiste già, provo a cambiare il MAC di sensor1 in quello di sensor2
        const payload = {
            macAddress: TEST_SENSORS.sensor2.macAddress,
            name: "Try MAC update",
            description: "Should conflict"
        };

        const res = await request(app)
            .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${TEST_SENSORS.sensor1.macAddress}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send(payload);

        expect(res.status).toBe(409);
        expect(res.body).toEqual(expect.objectContaining({
            code: 409,
            name: "ConflictError"
        }));
    });
});

describe("DELETE /networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac (e2e)", () => {

    let adminToken: string;
    let operatorToken: string;
    let viewerToken: string;
  
    const networkCode = TEST_NETWORKS.network1.code;
    const gatewayMac = TEST_GATEWAYS.gateway1.macAddress;
  
    beforeAll(async () => {
      await beforeAllE2e();
      adminToken = generateToken(TEST_USERS.admin);
      operatorToken = generateToken(TEST_USERS.operator);
      viewerToken = generateToken(TEST_USERS.viewer);
    });
  
    afterAll(async () => {
      await afterAllE2e();
    });

    it("deletes a sensor as admin", async () => {
        const res = await request(app)
            .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${TEST_SENSORS.sensor1.macAddress}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(204);
    });

    it("deletes a sensor as operator", async () => {
        const res = await request(app)
            .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${TEST_SENSORS.sensor2.macAddress}`)
            .set("Authorization", `Bearer ${operatorToken}`);

        expect(res.status).toBe(204);
    });

    it("returns 401 if no token is provided", async () => {
        const res = await request(app)
            .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${TEST_SENSORS.sensor1.macAddress}`);

        expect(res.status).toBe(401);
        expect(res.body).toEqual(expect.objectContaining({
            code: 401,
            name: "UnauthorizedError"
        }));
    });

    it("returns 403 if user has insufficient rights (viewer)", async () => {
        const res = await request(app)
            .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${TEST_SENSORS.sensor1.macAddress}`)
            .set("Authorization", `Bearer ${viewerToken}`);

        expect(res.status).toBe(403);
        expect(res.body).toEqual(expect.objectContaining({
            code: 403,
            name: "InsufficientRightsError"
        }));
    });

    it("returns 404 if the sensor does not exist", async () => {
        const res = await request(app)
            .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/invalid-sensor`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual(expect.objectContaining({
            code: 404,
            name: "NotFoundError"
        }));
    });

    
});