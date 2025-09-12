import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { SensorDAO } from "@dao/SensorDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";

export class SensorRepository {
  
  private repo: Repository<SensorDAO>;
  constructor() {
    this.repo = AppDataSource.getRepository(SensorDAO);
  }

  // retrieves all sensors of a given gateway in a given network from the database

  async getAllSensors(networkCode: string, gatewayMac: string): Promise<SensorDAO[]> {

    const networkRepo = AppDataSource.getRepository(NetworkDAO);

    findOrThrowNotFound(
      await networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found`
    );

    const gatewayRepo = AppDataSource.getRepository(GatewayDAO);

    findOrThrowNotFound(
      await gatewayRepo.find({ 
        where: { 
          macAddress: gatewayMac, 
          network: {
            code: networkCode
          }
        }
      }),
      () => true,
      `Gateway with MAC '${gatewayMac}' in Network with CODE '${networkCode}' not found`
    );

    return this.repo.find({
      where: {
        gateway: {
          macAddress: gatewayMac,
          network: {
            code: networkCode
          }
        }
      },
      relations: {
        gateway: {
          network: true
        }
      }
    });
  }

  // creates a new sensor in a specified gateway in a specified network

  async createSensor(
    networkCode: string,
    gatewayMac: string,
    macAddress: string,
    name: string,
    description: string,
    variable: string,
    unit: string
  ): Promise<SensorDAO> {

    const networkRepo = AppDataSource.getRepository(NetworkDAO);

    findOrThrowNotFound(
      await networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found`
    );

    const gatewayRepo = AppDataSource.getRepository(GatewayDAO);

    const gateway = findOrThrowNotFound(
      await gatewayRepo.find({ 
        where: { 
          macAddress: gatewayMac, 
          network: {
            code: networkCode
          }
        }
      }),
      () => true,
      `Gateway with MAC '${gatewayMac}' in Network with CODE '${networkCode}' not found`
    );

    throwConflictIfFound(
        await this.repo.find({ where: { macAddress } }),
        () => true,
        `Sensor with MAC '${macAddress}' already exists`
    );

    // Save the sensor associated with the found gateway
    return this.repo.save({
        macAddress,
        name,
        description,
        variable,
        unit,
        gateway,
    });

    }
  
    // retrieves a sensor by its MAC address in a specified gateway in a specified network
    async getSensor(networkCode: string, gatewayMac: string, sensorMac: string): Promise<SensorDAO> {

      const networkRepo = AppDataSource.getRepository(NetworkDAO);

      findOrThrowNotFound(
        await networkRepo.find({ where: { code: networkCode } }),
        () => true,
        `Network with code '${networkCode}' not found`
      );
  
      const gatewayRepo = AppDataSource.getRepository(GatewayDAO);
  
      findOrThrowNotFound(
        await gatewayRepo.find({ 
          where: { 
            macAddress: gatewayMac, 
            network: {
              code: networkCode
            }
          }
        }),
        () => true,
        `Gateway with MAC '${gatewayMac}' in Network with CODE '${networkCode}' not found'`
      );

      return findOrThrowNotFound(
          await this.repo.find({
              where: {
                  macAddress: sensorMac,
                  gateway: {
                      macAddress: gatewayMac,
                      network: {
                          code: networkCode,
                      },
                  },
              },
              relations: ["gateway", "gateway.network"],
          }),
          () => true,
          `Sensor with MAC '${sensorMac}' in Gateway with MAC '${gatewayMac}' in Network with MAC '${sensorMac}' not found`
      );
    }
  

    // updates a sensor in a specified gateway in a specified network
    async updateSensor(
        networkCode: string,
        gatewayMac: string,
        sensorMac: string,  // old MAC address (sensor to modify)
        macAddress: string, // new MAC address
        name: string,
        description: string,
        variable: string,
        unit: string
    ): Promise<SensorDAO> {

      const sensor = await this.getSensor(networkCode, gatewayMac, sensorMac);
  
      if (macAddress !== sensorMac && macAddress !== undefined) {
          throwConflictIfFound(
              await this.repo.find({ where: { macAddress } }),
              () => true,
              `Sensor with MAC '${macAddress}' already exists`
          );
          sensor.macAddress = macAddress ?? sensor.macAddress;
      }
  
      // remember: SensorFromJSON() in dto/Sensor.ts sets to undefined if not present

      sensor.name = name ?? sensor.name;
      sensor.description = description ?? sensor.description;
      sensor.variable = variable ?? sensor.variable;
      sensor.unit = unit ?? sensor.unit;
  
      return await this.repo.save(sensor);
    }
  

  async deleteSensor(networkCode: string, gatewayMac: string, sensorMac: string): Promise<void> {

    const sensor = await this.getSensor(networkCode, gatewayMac, sensorMac);
    
    await this.repo.remove(sensor);
  }

}
