import { Network as NetworkDTO } from "@dto/Network";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { mapNetworkDAOToDTO } from "@services/mapperService";

export async function getAllNetworks(): Promise<NetworkDTO[]> {
    const networkRepo = new NetworkRepository();
    return (await networkRepo.getAllNetworks()).map((network: NetworkDAO) => {
        return mapNetworkDAOToDTO(network);
    });
}

export async function createNewNetwork(networkDto: NetworkDTO): Promise<void> {
    const networkRepo = new NetworkRepository();
    await networkRepo.createNewNetwork(networkDto.code, networkDto.name, networkDto.description);
}
  

export async function getNetworkByCode(networkCode: string): Promise<NetworkDTO> {
    const networkRepo = new NetworkRepository();

    return mapNetworkDAOToDTO(await networkRepo.getNetworkByCode(networkCode));
}

export async function updateNetwork(networkCode: string, networkDto: NetworkDTO): Promise<void> {

    const networkRepo = new NetworkRepository();

    await networkRepo.updateNetwork(networkCode, networkDto.code, networkDto.name, networkDto.description);
}

export async function deleteNetwork(networkCode: string): Promise<void> {
    
    const networkRepo = new NetworkRepository();

    await networkRepo.deleteNetwork(networkCode);
}
