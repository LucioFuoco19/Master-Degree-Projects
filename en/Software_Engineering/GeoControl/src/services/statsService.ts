import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";
import { Stats as StatsDTO } from "@dto/Stats";

export function getMeasurementsDTO(sensorMac: string, measurementsList: MeasurementDTO[], startDate: string, endDate: string): MeasurementsDTO {

    // if (measurementsList.length === 0){
    //     return {
    //         sensorMacAddress: sensorMac,
    //         stats: undefined,
    //         measurements: []
    //     };
    // }

    let statsObj = computeStats(measurementsList, startDate, endDate);

    let measurementsObj: MeasurementsDTO = {
        sensorMacAddress: sensorMac,
        stats: statsObj,
        measurements: measurementsList
    }

    return measurementsObj;
}

export function getOutliersDTO(sensorMac: string, measurementsList: MeasurementDTO[], startDate: string, endDate: string): MeasurementsDTO {

    // if (measurementsList.length === 0){
    //     return {
    //         sensorMacAddress: sensorMac,
    //         stats: undefined,
    //         measurements: []
    //     };
    // }

    let statsObj = computeStats(measurementsList, startDate, endDate);

    let outliersList = measurementsList.filter((measurement: MeasurementDTO) => measurement.isOutlier);

    let measurementsObj: MeasurementsDTO = {
        sensorMacAddress: sensorMac,
        stats: statsObj,
        measurements: outliersList
    }

    return measurementsObj;
}

export function computeStats(measurementsList: MeasurementDTO[], passedStartDate: string, passedEndDate: string): StatsDTO {

    if (measurementsList.length === 0) {
        let statsObj: StatsDTO = {
            startDate: passedStartDate === undefined ? new Date(0) : new Date(passedStartDate),
            endDate: passedEndDate === undefined ? new Date() : new Date(passedEndDate),
            mean: 0,
            variance: 0,
            upperThreshold: 0,
            lowerThreshold: 0
        }

        return statsObj;
    }else{
        let mean =  getMean(measurementsList);
        let variance = getVariance(measurementsList);
        let upperThreshold = getUpperThreshold(mean, variance);
        let lowerThreshold =  getLowerThreshold(mean, variance);
        // let startDate =  getStartDate(measurementsList);
        // let endDate =  getEndDate(measurementsList);
        let startDate = passedStartDate === undefined ? new Date(0) : new Date(passedStartDate);
        let endDate = passedEndDate === undefined ? new Date() : new Date(passedEndDate);
    
        let statsObj: StatsDTO = {
            startDate: startDate,
            endDate: endDate,
            mean: mean,
            variance: variance,
            upperThreshold: upperThreshold,
            lowerThreshold: lowerThreshold
        };
    
        setOutliers(measurementsList, upperThreshold, lowerThreshold);
    
        return statsObj;
    }
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

function getMean(measurementsList: MeasurementDTO[]): number {
    let sum = 0;
    for (let i = 0; i < measurementsList.length; i++) {
        sum += measurementsList[i].value;
    }
    return round2(sum / measurementsList.length);
}

function getVariance(measurementsList: MeasurementDTO[]): number {
    let sum = 0;
    let mean = getMean(measurementsList);
    for (let i = 0; i < measurementsList.length; i++) {
        sum += Math.pow(measurementsList[i].value - mean, 2);
    }
    return round2(sum / measurementsList.length);
}

function getUpperThreshold(mean: number, variance: number): number {
    return round2(mean + 2 * Math.sqrt(variance));
}

function getLowerThreshold(mean: number, variance: number): number {
    return round2(mean - 2 * Math.sqrt(variance));
}

// function getStartDate(measurementsList: MeasurementDTO[]): Date {
//     if (measurementsList.length === 0) {
//         throw new Error("Cannot compute startDate from an empty measurements list.");
//     }
//     let startDate = measurementsList[0].createdAt;
//     for (let i = 1; i < measurementsList.length; i++) {
//         if (measurementsList[i].createdAt < startDate) {
//             startDate = measurementsList[i].createdAt;
//         }
//     }
//     return startDate;
// }

// function getEndDate(measurementsList: MeasurementDTO[]): Date {
//     let endDate = measurementsList[0].createdAt;
//     for (let i = 1; i < measurementsList.length; i++) {
//         if (measurementsList[i].createdAt > endDate) {
//             endDate = measurementsList[i].createdAt;
//         }
//     }
//     return endDate;
// }

function setOutliers (measurementsList: MeasurementDTO[], upperThreshold: number, lowerThreshold: number) {
    for (let i = 0; i < measurementsList.length; i++) {
        if (measurementsList[i].value > upperThreshold || measurementsList[i].value < lowerThreshold) {
            measurementsList[i].isOutlier = true;
        } else {
            measurementsList[i].isOutlier = false;
        }
    }
}
