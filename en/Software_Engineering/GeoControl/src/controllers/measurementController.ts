import { MeasurementRepository } from "@repositories/MeasurementRepository";


export async function createMeasurement(networkCode: string, gatewayMac: string, sensorMac: string, createdAt: Date, value: number): Promise<void> {
    
    const measurementRepo = new MeasurementRepository();

    await measurementRepo.createMeasurement(networkCode, gatewayMac, sensorMac, createdAt, value);
}

export async function getSensorMeasurements(networkCode: string, gatewayMac: string, sensorMac: string, startDate?: string, endDate?: string) {
    
    const measurementRepo = new MeasurementRepository();

    return await measurementRepo.getSensorMeasurements(networkCode, gatewayMac, sensorMac, startDate, endDate);
    
}

export async function getSensorsNetworkMeasurements(networkCode: string, sensorMacs?: string[], startDate?: string, endDate?: string) {
    
    const measurementRepo = new MeasurementRepository();

    return await measurementRepo.getSensorsNetworkMeasurements(networkCode, sensorMacs, startDate, endDate);
}

export async function getSensorStats(networkCode: string, gatewayMac: string, sensorMac: string, startDate?: string, endDate?: string) {
        
    const measurementRepo = new MeasurementRepository();

    return await measurementRepo.getSensorStats(networkCode, gatewayMac, sensorMac, startDate, endDate);
}

export async function getSensorsNetworkStats(networkCode: string, sensorMacs?: string[], startDate?: string, endDate?: string) {
    
    const measurementRepo = new MeasurementRepository();

    return await measurementRepo.getSensorsNetworkStats(networkCode, sensorMacs, startDate, endDate);
}

export async function getSensorOutliers(networkCode: string, gatewayMac: string, sensorMac: string, startDate?: string, endDate?: string) {
    
    const measurementRepo = new MeasurementRepository();

    return await measurementRepo.getSensorOutliers(networkCode, gatewayMac, sensorMac, startDate, endDate);
}

export async function getSensorsNetworkOutliers(networkCode: string, sensorMacs?: string[], startDate?: string, endDate?: string) {
    
    const measurementRepo = new MeasurementRepository();

    return await measurementRepo.getSensorsNetworkOutliers(networkCode, sensorMacs, startDate, endDate);
}