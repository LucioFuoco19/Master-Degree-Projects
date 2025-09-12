import {
    createErrorDTO,
    createTokenDTO,
    createUserDTO,
    mapUserDAOToDTO,
    createSensorDTO,
    mapSensorDAOToDTO,
    createGatewayDTO,
    mapGatewayDAOToDTO,
    createNetworkDTO,
    mapNetworkDAOToDTO,
    createMeasurementDTO,
    mapMeasurementDAOToDTO
  } from "@services/mapperService";
  
  import { UserType } from "@models/UserType";
  import { UserDAO } from "@models/dao/UserDAO";
  import { SensorDAO } from "@models/dao/SensorDAO";
  import { GatewayDAO } from "@models/dao/GatewayDAO";
  import { NetworkDAO } from "@models/dao/NetworkDAO";
  import { MeasurementDAO } from "@models/dao/MeasurementDAO";
  
  describe("MapperService", () => {
  
    describe("createErrorDTO", () => {
      it("should create ErrorDTO without undefined fields", () => {
        const dto = createErrorDTO(404, undefined, "NotFound");
        expect(dto).toEqual({ code: 404, name: "NotFound" });
      });
    });
  
    describe("createTokenDTO", () => {
      it("should create TokenDTO", () => {
        const dto = createTokenDTO("abc123");
        expect(dto).toEqual({ token: "abc123" });
      });
    });
  
    describe("createUserDTO and mapUserDAOToDTO", () => {
      it("should create UserDTO", () => {
        const dto = createUserDTO("alice", UserType.Admin, undefined);
        expect(dto).toEqual({ username: "alice", type: UserType.Admin });
      });
  
      it("should map UserDAO to UserDTO", () => {
        const userDAO: UserDAO = {
          username: "bob",
          type: UserType.Viewer,
          password: "bobbpass"
        };
        const dto = mapUserDAOToDTO(userDAO);
        expect(dto).toEqual({ username: "bob", type: UserType.Viewer });
      });
    });
  
    describe("createSensorDTO and mapSensorDAOToDTO", () => {
      const sensorDAO: SensorDAO = {
        macAddress: "00:11:22:33:44:55",
        name: "TempSensor",
        description: "Measures temperature",
        variable: "temperature",
        unit: "C",
        sensorID: 0,
        gateway: new GatewayDAO(),
        measurements: []
      };
  
      const expectedSensorDTO = {
        macAddress: "00:11:22:33:44:55",
        name: "TempSensor",
        description: "Measures temperature",
        variable: "temperature",
        unit: "C"
      };
  
      it("should create SensorDTO", () => {
        const dto = createSensorDTO(
          sensorDAO.macAddress,
          sensorDAO.name,
          sensorDAO.description,
          sensorDAO.variable,
          sensorDAO.unit
        );
        expect(dto).toEqual(expectedSensorDTO);
      });
  
      it("should map SensorDAO to SensorDTO", () => {
        const dto = mapSensorDAOToDTO(sensorDAO);
        expect(dto).toEqual(expectedSensorDTO);
      });
    });
  
    describe("createGatewayDTO and mapGatewayDAOToDTO", () => {
      const sensor: SensorDAO = {
        macAddress: "11:22:33:44:55:66",
        name: "HumSensor",
        description: "Measures humidity",
        variable: "humidity",
        unit: "%",
        sensorID: 0,
        gateway: new GatewayDAO(),
        measurements: []
      };
  
      const gatewayDAO: GatewayDAO = {
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Main gateway",
        sensors: [sensor],
        gatewayID: 0,
        network: new NetworkDAO()
      };
  
      const expectedGatewayDTO = {
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Main gateway",
        sensors: [
          {
            macAddress: "11:22:33:44:55:66",
            name: "HumSensor",
            description: "Measures humidity",
            variable: "humidity",
            unit: "%"
          }
        ]
      };
  
      it("should create GatewayDTO", () => {
        const sensorDTO = createSensorDTO(
          sensor.macAddress,
          sensor.name,
          sensor.description,
          sensor.variable,
          sensor.unit
        );
      
        const dto = createGatewayDTO(
          gatewayDAO.macAddress,
          gatewayDAO.name,
          gatewayDAO.description,
          [sensorDTO]
        );
      
        expect(dto).toEqual(expectedGatewayDTO);
      });
      
  
      it("should map GatewayDAO to GatewayDTO", () => {
        const dto = mapGatewayDAOToDTO(gatewayDAO);
        expect(dto).toEqual(expectedGatewayDTO);
      });
    });
  
    describe("createNetworkDTO and mapNetworkDAOToDTO", () => {
      const sensor: SensorDAO = {
        macAddress: "22:33:44:55:66:77",
        name: "PressureSensor",
        description: "Measures pressure",
        variable: "pressure",
        unit: "Pa",
        sensorID: 0,
        gateway: new GatewayDAO(),
        measurements: []
      };
  
      const gateway: GatewayDAO = {
        macAddress: "FF:EE:DD:CC:BB:AA",
        name: "Gateway 2",
        description: "Backup gateway",
        sensors: [sensor],
        gatewayID: 0,
        network: new NetworkDAO()
      };
  
      const networkDAO: NetworkDAO = {
        code: "NET-001",
        name: "Network A",
        description: "Test network",
        gateways: [gateway],
        networkID: 0
      };
  
      const expectedNetworkDTO = {
        code: "NET-001",
        name: "Network A",
        description: "Test network",
        gateways: [
          {
            macAddress: "FF:EE:DD:CC:BB:AA",
            name: "Gateway 2",
            description: "Backup gateway",
            sensors: [
              {
                macAddress: "22:33:44:55:66:77",
                name: "PressureSensor",
                description: "Measures pressure",
                variable: "pressure",
                unit: "Pa"
              }
            ]
          }
        ]
      };
  
      it("should create NetworkDTO", () => {
        const sensorDTO = createSensorDTO(
          sensor.macAddress,
          sensor.name,
          sensor.description,
          sensor.variable,
          sensor.unit
        );
      
        const gatewayDTO = createGatewayDTO(
          gateway.macAddress,
          gateway.name,
          gateway.description,
          [sensorDTO]
        );
      
        const dto = createNetworkDTO(
          networkDAO.code,
          networkDAO.name,
          networkDAO.description,
          [gatewayDTO]
        );
      
        expect(dto).toEqual(expectedNetworkDTO);
      });
      
  
      it("should map NetworkDAO to NetworkDTO", () => {
        const dto = mapNetworkDAOToDTO(networkDAO);
        expect(dto).toEqual(expectedNetworkDTO);
      });
    });
  
    describe("createMeasurementDTO and mapMeasurementDAOToDTO", () => {
      const measurementDAO: MeasurementDAO = {
        createdAt: new Date("2023-01-01T00:00:00Z"),
        value: 42.5,
        sensor: new SensorDAO(),
        measurementID: 0
      };
  
      const expectedMeasurementDTO = {
        createdAt: new Date("2023-01-01T00:00:00Z"),
        value: 42.5
      };
  
      it("should create MeasurementDTO", () => {
        const dto = createMeasurementDTO(measurementDAO.createdAt, measurementDAO.value);
        expect(dto).toEqual(expectedMeasurementDTO);
      });
  
      it("should map MeasurementDAO to MeasurementDTO", () => {
        const dto = mapMeasurementDAOToDTO(measurementDAO);
        expect(dto).toEqual(expectedMeasurementDTO);
      });
    });
  });
  