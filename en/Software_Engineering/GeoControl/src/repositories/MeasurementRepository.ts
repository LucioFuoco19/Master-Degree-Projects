import { AppDataSource } from "@database";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { mapMeasurementDAOToDTO } from "@services/mapperService";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";
import { findOrThrowNotFound } from "@utils";
import { Between, Repository } from "typeorm";
import { computeStats, getMeasurementsDTO, getOutliersDTO } from "@services/statsService";
import { Stats as StatsDTO } from "@dto/Stats";


export class MeasurementRepository {

    private repo: Repository<MeasurementDAO>;

    constructor() {
        this.repo = AppDataSource.getRepository(MeasurementDAO);
    }

    private async validateNetwork(networkCode: string): Promise<NetworkDAO> {
        const networkRepo = AppDataSource.getRepository(NetworkDAO);
        return findOrThrowNotFound(
            await networkRepo.find({ where: { code: networkCode } }),
            () => true,
            `Network with code '${networkCode}' not found`
        );
    }
    
    private async validateGateway(networkCode: string, gatewayMac: string): Promise<GatewayDAO> {
        const gatewayRepo = AppDataSource.getRepository(GatewayDAO);
        return findOrThrowNotFound(
            await gatewayRepo.find({ 
                where: { 
                    macAddress: gatewayMac, 
                    network: { code: networkCode }
                }
            }),
            () => true,
            `Gateway with MAC '${gatewayMac}' in Network with CODE '${networkCode}' not found`
        );
    }
    
    private async validateSensor(networkCode: string, gatewayMac: string, sensorMac: string): Promise<SensorDAO> {
        const sensorRepo = AppDataSource.getRepository(SensorDAO);
        return findOrThrowNotFound(
            await sensorRepo.find({ 
                where: { 
                    macAddress: sensorMac, 
                    gateway: {
                        macAddress: gatewayMac,
                        network: { code: networkCode }
                    }
                }
            }),
            () => true,
            `Sensor with MAC '${sensorMac}' in Gateway with MAC '${gatewayMac}' in Network with CODE '${networkCode}' not found`
        );
    }
    
    private buildDateClause(startDate?: string, endDate?: string): object | undefined {
        if (startDate && endDate) {
            return Between(new Date(startDate), new Date(endDate));
        } else if (startDate) {
            return Between(new Date(startDate), new Date());
        } else if (endDate) {
            return Between(new Date(0), new Date(endDate));
        }
        return undefined;
    }    

    async createMeasurement(networkCode: string, gatewayMac: string, sensorMac: string, createdAt: Date, value: number): Promise<MeasurementDAO> {        

        await this.validateNetwork(networkCode);
        await this.validateGateway(networkCode, gatewayMac);
        const sensor = await this.validateSensor(networkCode, gatewayMac, sensorMac);
        
        return this.repo.save({
            createdAt: createdAt,
            value: value,
            sensor: sensor
        });


    }

    // retrieve measurements of a specific sensor located in a specific gateway in a specific network
    // filtered by startDate and endDate
    
    async getSensorMeasurements(networkCode: string, gatewayMac: string, sensorMac: string, startDate: string, endDate: string) : Promise<MeasurementsDTO> {

        await this.validateNetwork(networkCode);
        await this.validateGateway(networkCode, gatewayMac);
        await this.validateSensor(networkCode, gatewayMac, sensorMac);

        // let startDateObject: Date = startDate ? new Date(startDate) : undefined;
        // let endDateObject: Date = endDate ? new Date(endDate) : undefined;

        const whereClause : any = {
            sensor: {
                macAddress: sensorMac,
                gateway: {
                    macAddress: gatewayMac,
                    network: {
                        code: networkCode
                    }
                }
            }
        }

        whereClause.createdAt = this.buildDateClause(startDate, endDate);

        const measures =  (await this.repo.find({
            where: whereClause,
            relations: {
                sensor: {
                    gateway: {
                        network: true
                    }
                }
            }
        })).sort((a, b) => (a.createdAt.getTime() - b.createdAt.getTime())) ?? []; // empty array if no measurements are found, otherwise sort by date

        const measuresDto =  measures.map((measurement: MeasurementDAO) => {
            return mapMeasurementDAOToDTO(measurement)
        });

        return getMeasurementsDTO(sensorMac, measuresDto, startDate, endDate);
    }

    async getSensorsNetworkMeasurements(networkCode: string, sensorMacs: string[], startDate: string, endDate: string) : Promise<MeasurementsDTO[]> {

        await this.validateNetwork(networkCode);

        const sensorRepo = AppDataSource.getRepository(SensorDAO);

        let sensors: SensorDAO[] = [];

        if (!sensorMacs || sensorMacs.length === 0) {

            sensors = await sensorRepo.find({ 
                where: { 
                    gateway: {
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

        }else{

            sensors = await sensorRepo.find({
                where: sensorMacs.map(mac => ({
                  macAddress: mac,
                  gateway: {
                    network: {
                      code: networkCode,
                    },
                  },
                })),
                relations: {
                  gateway: {
                    network: true,
                  },
                },
              });
        }

        let listOfMeasurements: MeasurementsDTO[] = [];

        for (const sensor of sensors) {

            listOfMeasurements.push(await this.getSensorMeasurements(networkCode, sensor.gateway.macAddress, sensor.macAddress, startDate, endDate));
        }
        
        return listOfMeasurements;

    }

    async getSensorStats(networkCode: string, gatewayMac: string, sensorMac: string, startDate: string, endDate: string): Promise<StatsDTO> {
    
        await this.validateNetwork(networkCode);
        await this.validateGateway(networkCode, gatewayMac);
        await this.validateSensor(networkCode, gatewayMac, sensorMac);


        const whereClause : any = {
            sensor: {
                macAddress: sensorMac,
                gateway: {
                    macAddress: gatewayMac,
                    network: {
                        code: networkCode
                    }
                }
            }
        }

        whereClause.createdAt = this.buildDateClause(startDate, endDate);

        const measures =  (await this.repo.find({
            where: whereClause,
            relations: {
                sensor: {
                    gateway: {
                        network: true
                    }
                }
            }
        })).sort((a, b) => (a.createdAt.getTime() - b.createdAt.getTime())) ?? []; // empty array if no measurements are found, otherwise sort by date

        const measuresDto =  measures.map((measurement: MeasurementDAO) => {
            return mapMeasurementDAOToDTO(measurement)
        });

        return computeStats(measuresDto, startDate, endDate); 

    }



    async getSensorsNetworkStats(networkCode: string, sensorMacs: string[], startDate: string, endDate: string): Promise<any[]> {

        await this.validateNetwork(networkCode);

        const sensorRepo = AppDataSource.getRepository(SensorDAO);

        let sensors: SensorDAO[] = [];

        if (!sensorMacs || sensorMacs.length === 0) {

            sensors = await sensorRepo.find({ 
                where: { 
                    gateway: {
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

        }else{

            sensors = await sensorRepo.find({
                where: sensorMacs.map(mac => ({
                  macAddress: mac,
                  gateway: {
                    network: {
                      code: networkCode,
                    },
                  },
                })),
                relations: {
                  gateway: {
                    network: true,
                  },
                },
              });
        }        

        let listOfStats: any[] = [];

        for (const sensor of sensors) {

            const whereClause : any = {
                sensor: {
                    macAddress: sensor.macAddress,
                    gateway: {
                        macAddress: sensor.gateway.macAddress,
                        network: {
                            code: networkCode
                        }
                    }
                }
            }
    
            whereClause.createdAt = this.buildDateClause(startDate, endDate);

            const measures =  (await this.repo.find({
                where: whereClause,
                relations: {
                    sensor: {
                        gateway: {
                            network: true
                        }
                    }
                }
            })).sort((a, b) => (a.createdAt.getTime() - b.createdAt.getTime())) ?? [];            

            const measuresDto =  measures.length!=0 
            ? measures.map((measurement: MeasurementDAO) => {
                return mapMeasurementDAOToDTO(measurement)
            })
            : [];

            listOfStats.push({
                sensorMacAddress: sensor.macAddress,
                stats: computeStats(measuresDto, startDate, endDate)
            })
        }

        return listOfStats;
        
    }

    async getSensorOutliers(networkCode: string, gatewayMac: string, sensorMac: string, startDate: string, endDate: string) : Promise<MeasurementsDTO> {

        await this.validateNetwork(networkCode);
        await this.validateGateway(networkCode, gatewayMac);
        await this.validateSensor(networkCode, gatewayMac, sensorMac);

        const whereClause : any = {
            sensor: {
                macAddress: sensorMac,
                gateway: {
                    macAddress: gatewayMac,
                    network: {
                        code: networkCode
                    }
                }
            }
        }

        whereClause.createdAt = this.buildDateClause(startDate, endDate);

        const measures =  (await this.repo.find({
            where: whereClause,
            relations: {
                sensor: {
                    gateway: {
                        network: true
                    }
                }
            }
        })).sort((a, b) => (a.createdAt.getTime() - b.createdAt.getTime())) ?? []; // empty array if no measurements are found, otherwise sort by date

        const measuresDto =  measures.map((measurement: MeasurementDAO) => {
            return mapMeasurementDAOToDTO(measurement)
        });

        return getOutliersDTO(sensorMac, measuresDto, startDate, endDate);
    }

    async getSensorsNetworkOutliers(networkCode: string, sensorMacs: string[], startDate: string, endDate: string) : Promise<MeasurementsDTO[]> {
            
            await this.validateNetwork(networkCode);
    
            const sensorRepo = AppDataSource.getRepository(SensorDAO);
    
            let sensors: SensorDAO[] = [];
    
            if (!sensorMacs || sensorMacs.length === 0) {
    
                sensors = await sensorRepo.find({ 
                    where: { 
                        gateway: {
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
    
            }else{
    
                sensors = await sensorRepo.find({
                    where: sensorMacs.map(mac => ({
                    macAddress: mac,
                    gateway: {
                        network: {
                        code: networkCode,
                        },
                    },
                    })),
                    relations: {
                    gateway: {
                        network: true,
                    },
                    },
                });
            }
    
            let listOfOutliers: MeasurementsDTO[] = [];
    
            for (const sensor of sensors) {
    
                listOfOutliers.push(await this.getSensorOutliers(networkCode, sensor.gateway.macAddress, sensor.macAddress, startDate, endDate));
            }
            
            return listOfOutliers;
    
        }

}