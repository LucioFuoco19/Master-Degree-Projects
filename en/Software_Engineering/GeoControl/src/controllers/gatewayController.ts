import { GatewayDAO } from "@models/dao/GatewayDAO";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { mapGatewayDAOToDTO } from "@services/mapperService";

export async function getAllGateways(networkCode: string): Promise<GatewayDTO[]> {

    const gatewayRepo = new GatewayRepository();

    return (await gatewayRepo.getAllGateways(networkCode)).map((gateway: GatewayDAO) => {
        return mapGatewayDAOToDTO(gateway);
    });
}

export async function createGateway(networkCode: string, gatewayDto: GatewayDTO): Promise<void> {

    const gatewayRepo = new GatewayRepository();

    await gatewayRepo.createGateway(networkCode, gatewayDto.macAddress, gatewayDto.name, gatewayDto.description);
}

export async function getGateway(networkCode: string, gatewayMac: string): Promise<GatewayDTO> {

    const gatewayRepo = new GatewayRepository();

    return mapGatewayDAOToDTO(await gatewayRepo.getGateway(networkCode, gatewayMac));
}

export async function updateGateway(networkCode: string, gatewayMac: string, gatewayDto: GatewayDTO): Promise<void> {

    const gatewayRepo = new GatewayRepository();

    await gatewayRepo.updateGateway(networkCode, gatewayMac, gatewayDto.macAddress, gatewayDto.name, gatewayDto.description);
}

export async function deleteGateway(networkCode: string, gatewayMac: string): Promise<void> {

    const gatewayRepo = new GatewayRepository();

    await gatewayRepo.deleteGateway(networkCode, gatewayMac);
}