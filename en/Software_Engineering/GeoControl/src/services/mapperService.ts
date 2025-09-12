import { Token as TokenDTO } from "@dto/Token";
import { User as UserDTO } from "@dto/User";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { Gateway as GatewayDTO} from "@models/dto/Gateway";
import { Network as NetworkDTO } from "@dto/Network";
import { UserDAO } from "@models/dao/UserDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { ErrorDTO } from "@models/dto/ErrorDTO";
import { UserType } from "@models/UserType";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { Network } from "inspector/promises";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { Stats } from "@models/dto/Stats";

export function createErrorDTO(
  code: number,
  message?: string,
  name?: string
): ErrorDTO {
  return removeNullAttributes({
    code,
    name,
    message
  }) as ErrorDTO;
}

export function createTokenDTO(token: string): TokenDTO {
  return removeNullAttributes({
    token: token
  }) as TokenDTO;
}

export function createUserDTO(
  username: string,
  type: UserType,
  password?: string
): UserDTO {
  return removeNullAttributes({
    username,
    type,
    password
  }) as UserDTO;
}

export function mapUserDAOToDTO(userDAO: UserDAO): UserDTO {
  return createUserDTO(userDAO.username, userDAO.type);
}

// sensor

export function createSensorDTO(
  macAddress: string,
  name: string,
  description: string,
  variable: string,
  unit: string
): SensorDTO {
  return removeNullAttributes({
    macAddress,
    name,
    description,
    variable,
    unit
  }) as SensorDTO;
}

export function mapSensorDAOToDTO(sensorDAO: SensorDAO): SensorDTO {
  return createSensorDTO(
    sensorDAO.macAddress,
    sensorDAO.name,
    sensorDAO.description,
    sensorDAO.variable,
    sensorDAO.unit
  );
}

// gateway

export function createGatewayDTO(
  macAddress: string,
  name: string,
  description: string,
  sensors: SensorDTO[]
): GatewayDTO {
  return removeNullAttributes({
    macAddress,
    name,
    description,
    sensors
  }) as GatewayDTO;
}

export function mapGatewayDAOToDTO(gatewayDAO: GatewayDAO): GatewayDTO {
  return createGatewayDTO(
    gatewayDAO.macAddress,
    gatewayDAO.name,
    gatewayDAO.description,
    gatewayDAO.sensors.map((sensorDAO) =>
      createSensorDTO(
        sensorDAO.macAddress,
        sensorDAO.name,
        sensorDAO.description,
        sensorDAO.variable,
        sensorDAO.unit
      )
    )
  );
}

// netowrk

export function createNetworkDTO(
  code: string,
  name: string,
  description: string,
  gateways: GatewayDTO[]
): NetworkDTO {
  return removeNullAttributes({
    code,
    name,
    description,
    gateways
  }) as NetworkDTO;
}

export function mapNetworkDAOToDTO(networkDAO: NetworkDAO): NetworkDTO {
  return createNetworkDTO(
    networkDAO.code,
    networkDAO.name,
    networkDAO.description,
    networkDAO.gateways.map((gatewayDAO) =>
      createGatewayDTO(
        gatewayDAO.macAddress,
        gatewayDAO.name,
        gatewayDAO.description,
        gatewayDAO.sensors.map((sensorDAO) =>
          createSensorDTO(
            sensorDAO.macAddress,
            sensorDAO.name,
            sensorDAO.description,
            sensorDAO.variable,
            sensorDAO.unit
          )
        )
      )
    )
  );
}

// measurement
export function createMeasurementDTO(
  createdAt: Date,
  value: number,
): MeasurementDTO {
  return removeNullAttributes({
    createdAt,
    value,
    isOutlier : undefined
  }) as MeasurementDTO;
}

export function mapMeasurementDAOToDTO(measurementDAO: MeasurementDAO): MeasurementDTO {
  return createMeasurementDTO(
    measurementDAO.createdAt,
    measurementDAO.value
  );
}


function removeNullAttributes<T>(dto: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(dto).filter(
      ([_, value]) =>
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  ) as Partial<T>;
}


