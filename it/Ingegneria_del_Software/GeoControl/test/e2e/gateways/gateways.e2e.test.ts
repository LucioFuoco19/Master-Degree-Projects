import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS } from "@test/e2e/lifecycle";
  let tokenAdmin: string;
  let tokenOperator: string;
  let tokenViewer: string;
  const gatewayAddr="AA:BB:CC:DD:EE:01"
  const anotherGatewayAddr="AA:BB:CC:DD:EE:99"
  const networkCode ="NET01";
   const testGatewayAd = {
    macAddress: "AA:BB:CC:DD:EE:04",
    name: "Gateway Alpha admin",
    description: "Main gateway for Alpine sensors",
    sensors: []
  };
   const testGatewayOP = {
    macAddress: "AA:BB:CC:DD:EE:05",
    name: "Gateway Alpha operator",
    description: "Main gateway for Alpine sensors",
    sensors: []
  };
describe("GET/gateway E2E", () => {
  
  beforeAll(async () => {
    await beforeAllE2e();

    tokenAdmin = generateToken(TEST_USERS.admin);
    tokenOperator = generateToken(TEST_USERS.operator);
    tokenViewer = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });
  it("should get all gateways (Admin)", async () => {
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways`)
    .set("Authorization", `Bearer ${tokenAdmin}`);

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0)
  });
 it("should get all gateways (Operator)", async () => {
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways`)
    .set("Authorization", `Bearer ${tokenOperator}`);

   expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0)
});


  it("should get all gateways (Viewer)", async () => {
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways`)
    .set("Authorization", `Bearer ${tokenViewer}`);

   expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0)
});  
  it("should return 401 Unauthorized if no token provided", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways`);

    expect(res.status).toBe(401);
  });

  it("should return 404 if network not found", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/invalid-network/gateways`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(404);
  });
});

describe("POST /gateways (e2e)", () => { // per ora bene, ricontrolla alla fine la cosa degli error code sui viewer e 500
  beforeAll(async () => {
    await beforeAllE2e();
    tokenAdmin = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

   it("should create a new gateway (Admin)", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send(testGatewayAd);

    expect(res.status).toBe(201);
    
  });

  it("should create a new gateway (Operator)", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${tokenOperator}`)
      .send(testGatewayOP);

    expect(res.status).toBe(201);
  });
  it("should return 400 for invalid input data", async () => {
    const invalidData = { ...testGatewayAd, macAddress: 456 }; // o rimuovi campi obbligatori

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send(invalidData);

    expect(res.status).toBe(400);
  });
  it("should return 400 for invalid input data", async () => {
    const invalidData = { ...testGatewayOP, macAddress: 123 }; // o rimuovi campi obbligatori

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${tokenOperator}`)
      .send(invalidData);

    expect(res.status).toBe(400);
  });
  it("should return 401 if no token provided", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .send(testGatewayAd);

    expect(res.status).toBe(401);
  });

  it("should return 403 for insufficient rights (Viewer token)", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${tokenViewer}`)
      .send(testGatewayOP);

    expect(res.status).toBe(403);
  });

  it("should return 404 if network not found", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/invalid-network/gateways`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send(testGatewayAd);

    expect(res.status).toBe(404);
  });
  it("should return 404 if network not found", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/invalid-network/gateways`)
      .set("Authorization", `Bearer ${tokenOperator}`)
      .send(testGatewayOP);

    expect(res.status).toBe(404);
  });

  it("should return 409 if gateway mac address already in use", async () => {
    // Prima creiamo il gateway
    await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send(testGatewayAd);

    // Proviamo a crearne uno con lo stesso MAC (dovrebbe fallire)
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send(testGatewayAd);

    expect(res.status).toBe(409);
  });
  it("should return 409 if gateway mac address already in use", async () => {
    // Prima creiamo il gateway
    await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${tokenOperator}`)
      .send(testGatewayOP);

    // Proviamo a crearne uno con lo stesso MAC (dovrebbe fallire)
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${tokenOperator}`)
      .send(testGatewayOP);

    expect(res.status).toBe(409);
  });
});
 
describe("GET/ retieve a specific gateway (e2e)",()=>{ // dovrebbe essere ok 
   beforeAll(async () => {
    await beforeAllE2e();

    tokenAdmin = generateToken(TEST_USERS.admin);
    tokenOperator = generateToken(TEST_USERS.operator);
    tokenViewer = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });
  it("should get a specific gateway (Admin)", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayAddr}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.macAddress).toBe(gatewayAddr);
  });

  it("should get a specific gateway (Operator)", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayAddr}`)
      .set("Authorization", `Bearer ${tokenOperator}`);

    expect(res.status).toBe(200);
    expect(res.body.macAddress).toBe(gatewayAddr);
  });

  it("should get a specific gateway (Viewer)", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayAddr}`)
      .set("Authorization", `Bearer ${tokenViewer}`);

    expect(res.status).toBe(200);
    expect(res.body.macAddress).toBe(gatewayAddr);
  });

  it("should return 401 Unauthorized if no token provided", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${testGatewayAd.macAddress}`);

    expect(res.status).toBe(401);
  });

  it("should return 401 Unauthorized if token is invalid", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${testGatewayAd.macAddress}`)
      .set("Authorization", `Bearer invalidtoken`);

    expect(res.status).toBe(401);
  });

  it("should return 404 if gateway not found by Admin", async () => {
    const fakeMac = "00:00:00:00:00:00";

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${fakeMac}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(404);
  });
   it("should return 404 if gateway not found by Operator", async () => {
    const fakeMac = "00:00:00:00:00:00";

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${fakeMac}`)
      .set("Authorization", `Bearer ${tokenOperator}`);

    expect(res.status).toBe(404);
  });
  it("should return 404 if gateway not found by Viewer", async () => {
    const fakeMac = "00:00:00:00:00:00";

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${fakeMac}`)
      .set("Authorization", `Bearer ${tokenViewer}`);

    expect(res.status).toBe(404);
  });
});

describe("PATCH/ upgrade a gateway (e2e)",()=>{   //dovrebbe essere ok
   beforeAll(async () => {
    await beforeAllE2e();

    tokenAdmin = generateToken(TEST_USERS.admin);
    tokenOperator = generateToken(TEST_USERS.operator);
    tokenViewer = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });
     it("should update a gateway (Operator)", async () => {
    const updatedData = { ...testGatewayOP, name: "Updated by Operator" };

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayAddr}`)
      .set("Authorization", `Bearer ${tokenOperator}`)
      .send(updatedData);

    expect(res.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${testGatewayOP.macAddress}`)
      .set("Authorization", `Bearer ${tokenOperator}`);

    expect(getRes.body.name).toBe("Updated by Operator");
  });

  it("should update a gateway (Admin)", async () => {
    const updatedData = { ...testGatewayAd, name: "Updated by Admin" };

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${anotherGatewayAddr}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send(updatedData);

    expect(res.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${testGatewayAd.macAddress}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(getRes.body.name).toBe("Updated by Admin");
  });

   it("should return 403 if user has insufficient rights", async () => {
    const updatedData = { ...testGatewayOP, name: "Attempt by Viewer" };

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayAddr}`)
      .set("Authorization", `Bearer ${tokenViewer}`)
      .send(updatedData);

    expect(res.status).toBe(403); // oppure 401 se non autenticato
  });

  it("should return 404 if gateway not found", async () => {
    const nonExistentMac = "00:11:22:33:44:55";
    const updatedData = { ...testGatewayAd, mac: nonExistentMac, name: "Ghost Gateway" };

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${nonExistentMac}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send(updatedData);

    expect(res.status).toBe(404);
  });

  it("should return 404 if network not found", async () => {
    const updatedData = { ...testGatewayAd, name: "Wrong Network" };

    const res = await request(app)
      .patch(`/api/v1/networks/nonexistent-network/gateways/${testGatewayAd.macAddress}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send(updatedData);

    expect(res.status).toBe(404);
  });
  it("should return 409 if admin tries to update with a duplicate MAC", async () => {
  const anotherGateway = {
    macAddress: "11:22:33:44:55:66",
    name: "Other Gateway",
    description: "Another gateway",
  };

  await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send(anotherGateway);

  const conflictUpdate = { ...testGatewayAd, macAddress: anotherGateway.macAddress };

  const res = await request(app)
    .patch(`/api/v1/networks/${networkCode}/gateways/${testGatewayAd.macAddress}`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send(conflictUpdate);

  expect(res.status).toBe(409);
});

it("should return 409 if operator tries to update with a duplicate MAC", async () => {
  const anotherGateway = {
    macAddress: "22:33:44:55:66:77",
    name: "Other Gateway 2",
    description: "Another gateway",
  };

  await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send(anotherGateway);

  const conflictUpdate = { ...testGatewayOP, macAddress: anotherGateway.macAddress };

  const res = await request(app)
    .patch(`/api/v1/networks/${networkCode}/gateways/${testGatewayOP.macAddress}`)
    .set("Authorization", `Bearer ${tokenOperator}`)
    .send(conflictUpdate);

  expect(res.status).toBe(409);
});

it("should NOT update and return 403/401 if viewer tries to update (no conflict check needed)", async () => {
  const updatedData = { ...testGatewayOP, mac: "33:44:55:66:77:88", name: "Viewer Try" };

  const res = await request(app)
    .patch(`/api/v1/networks/${networkCode}/gateways/${testGatewayOP.macAddress}`)
    .set("Authorization", `Bearer ${tokenViewer}`)
    .send(updatedData);

  expect([401, 403]).toContain(res.status);
});
});

describe("DELETE/ delete a gateway (e2e)",()=>{   // dovrebbe essere fatta bene 
   beforeAll(async () => {
    await beforeAllE2e();
    
    tokenAdmin = generateToken(TEST_USERS.admin);
    tokenOperator = generateToken(TEST_USERS.operator);
    tokenViewer = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });
    it("should delete a gateway (Operator)", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayAddr}`)
      .set("Authorization", `Bearer ${tokenOperator}`);

    expect(res.status).toBe(204);

    // Verifica che il gateway non esista più
    const getRes = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${testGatewayOP.macAddress}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(getRes.status).toBe(404);
     
  });

  it("should delete a gateway (Admin)", async () => {
  
    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${anotherGatewayAddr}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(204);
    const getRes = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${anotherGatewayAddr}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(getRes.status).toBe(404);
     
  });

  
  it("should return 404 if gateway not found", async () => {
    const nonExistentMac = "00:11:22:33:44:55";

    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${nonExistentMac}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(404);
  });
   it("should return 401 Unauthorized if no token provided", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${testGatewayAd.macAddress}`);

    expect(res.status).toBe(401);
  });

  it("should return 403 Forbidden for Viewer", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${testGatewayAd.macAddress}`)
      .set("Authorization", `Bearer ${tokenViewer}`);

    expect(res.status).toBe(403);
  });

  it("should return 404 if network not found", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/invalidNetwork/gateways/${testGatewayAd.macAddress}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(404);
  });
});



 



  