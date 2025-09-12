import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { GatewayDAO } from "@dao/GatewayDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { NetworkRepository } from "./NetworkRepository";


export class GatewayRepository {
  private repo: Repository<GatewayDAO>;
  
  constructor() {
    this.repo = AppDataSource.getRepository(GatewayDAO);
  }
  
  // retrieve all gateways of a given network from the database

  async getAllGateways(networkCode: string): Promise<GatewayDAO[]> {

    // check if the network exists

    const networkRepo = AppDataSource.getRepository(NetworkDAO);

    findOrThrowNotFound(
      await networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found`
    );

    return this.repo.find({
      where: {
        network: {
          code: networkCode
        }
      },
      relations: {
        network: true,
        sensors: true
      }
    });
  }
    
  // crete a new gateway in a specified network

  async createGateway(networkCode: string, macAddress: string, name: string, description: string): Promise<GatewayDAO> {

    
    // Look up the network by networkCode
    const networkRepo = AppDataSource.getRepository(NetworkDAO);

    const network = findOrThrowNotFound(
        await networkRepo.find({
            where: {
                code: networkCode
            }
        }),
        () => true,
        `Network with code '${networkCode}' not found`
    );

    throwConflictIfFound(
      await this.repo.find({ where: { macAddress } }),
      () => true,
      `Gateway with MAC '${macAddress}' already exists`
    );

    return this.repo.save({
        macAddress,
        name,
        description,
        network,
    });
  }
       
  // retrieves a gateway by its MAC address and network code

  async getGateway(networkCode: string, gatewayMac: string): Promise<GatewayDAO> {

    // check if the network exists

    const networkRepo = AppDataSource.getRepository(NetworkDAO);

    findOrThrowNotFound(
      await networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found`
    );

    return findOrThrowNotFound(
      await this.repo.find({
          where: {
              macAddress: gatewayMac,
              network: {
                  code: networkCode
              }
          },
          relations: {
              network: true,
              sensors: true
          }
      }),
      () => true,
      `Gateway with MAC '${gatewayMac}' in network with CODE '${networkCode}' not found`
    );
  }
  
  // updates a gateway in a specified network

  async updateGateway(networkCode: string, gatewayMac: string, newMacAddress: string, newName: string, newDescription: string): Promise<void> {

    // check if the network exists

    const gateway = await this.getGateway(networkCode, gatewayMac);

    if(newMacAddress !== gateway.macAddress) {
      throwConflictIfFound(
        await this.repo.find({ where: { macAddress: newMacAddress } }),
        () => true,
        `Gateway with MAC '${newMacAddress}' already exists`
      );
    }

    gateway.macAddress = newMacAddress ?? gateway.macAddress;
    gateway.name = newName ?? gateway.name;
    gateway.description = newDescription ?? gateway.description;

    await this.repo.save(gateway);
}

// deletes a gateway in a specified network

async deleteGateway(networkCode: string, gatewayMac: string): Promise<void> {

    const gateway = await this.getGateway(networkCode, gatewayMac);

    await this.repo.remove(gateway);
}


}


