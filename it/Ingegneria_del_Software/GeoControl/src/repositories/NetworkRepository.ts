import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { Network as NetworkDTO } from "@dto/Network";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class NetworkRepository {
    private repo: Repository<NetworkDAO>;
    constructor() {
        this.repo = AppDataSource.getRepository(NetworkDAO);
    }

    // retrieves all networks from the database

    async getAllNetworks(): Promise<NetworkDAO[]> {
        return this.repo.find({
            relations: {
                gateways: {
                    sensors: true
                }
            }
        });
    }

    // creates a new network in the database


    async createNewNetwork(code: string, name: string, description: string): Promise<NetworkDAO> {

        throwConflictIfFound(
            await this.repo.find({ where: { code } }),
            () => true,
            `Network with code '${code}' already exists`
        );

        return this.repo.save({
            code,
            name,
            description
        });
    }

    // retrieves a network by its code from the database

    async getNetworkByCode(code: string): Promise<NetworkDAO> {
        const [result] = await this.repo.find({
            where: { code },
            relations: {
                gateways: {
                    sensors: true,
                },
            },
        });

        return findOrThrowNotFound(
            [result],
            (n) => !!n,
            `Network with code '${code}' not found`
        );
    }

    // updates a network in the database

    async updateNetwork(code: string, newCode: string, name: string, description: string): Promise<void> {

        const network = await this.getNetworkByCode(code);

        // check if newCode is undefined or have a min length
        if (!newCode || newCode.length < 1) {
            const error: any = new Error("Invalid new code: min length required of 1");
            error.status = 400;
            throw error;
        }

        // check if newCode is already in use
        if (code !== newCode) {
            throwConflictIfFound(
                await this.repo.find({ where: { code: newCode } }),
                () => true,
                `Network with code '${newCode}' already exists`
            );
        }

        network.code = newCode;
        network.name = name ?? network.name;
        network.description = description ?? network.description;

        await this.repo.save(network);
    }

    // deletes a network from the database

    async deleteNetwork(code: string): Promise<void> {

        const network = await this.getNetworkByCode(code);

        await this.repo.remove(network);
    }

}
