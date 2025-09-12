import { CONFIG } from "@config";
import { createMeasurement, getSensorMeasurements, getSensorOutliers, getSensorStats, getSensorsNetworkMeasurements, getSensorsNetworkOutliers, getSensorsNetworkStats } from "@controllers/measurementController";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import { MeasurementFromJSON } from "@models/dto/Measurement";
import { Router } from "express";

const router = Router();


router.post(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    const { networkCode, gatewayMac, sensorMac } = req.params;
    const payload = req.body;
    try {
      await Promise.all(payload.map((entry: any) => {
        const { createdAt, value } = MeasurementFromJSON(entry);
        return createMeasurement(networkCode, gatewayMac, sensorMac, createdAt, value);
      }));
      res.status(201).send();
    } catch (err) {
      next(err); 

  }
}
);



// Retrieve measurements for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const { networkCode, gatewayMac, sensorMac } = req.params;
      const { startDate, endDate } = req.query;
      
      res.status(200).json(await getSensorMeasurements(networkCode, gatewayMac, sensorMac, startDate as string, endDate as string));
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats", 
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]), 
  async (req, res, next) => {
    try {
      const { networkCode, gatewayMac, sensorMac } = req.params;
      const { startDate, endDate } = req.query;
      
      res.status(200).json(await getSensorStats(networkCode, gatewayMac, sensorMac, startDate as string, endDate as string));
    } catch (error) {
      next(error);
    }
});

// Retrieve only outliers for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const { networkCode, gatewayMac, sensorMac } = req.params;
      const { startDate, endDate } = req.query;
      
      res.status(200).json(await getSensorOutliers(networkCode, gatewayMac, sensorMac, startDate as string, endDate as string));
    } catch (error) {
      next(error);
    }
});

// Retrieve measurements for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const { networkCode } = req.params;
      const { startDate, endDate, sensorMacs } = req.query;

      const macs: string[] = sensorMacs
      ? Array.isArray(sensorMacs)
        ? sensorMacs as string[]
        : (sensorMacs as string).split(',')
      : [];
          

      res.status(200).json(await getSensorsNetworkMeasurements(networkCode, macs, startDate as string, endDate as string));
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const { networkCode } = req.params;
      const { startDate, endDate, sensorMacs } = req.query;

      const macs: string[] = sensorMacs
      ? Array.isArray(sensorMacs)
        ? sensorMacs as string[]
        : (sensorMacs as string).split(',')
      : [];
          

      res.status(200).json(await getSensorsNetworkStats(networkCode, macs, startDate as string, endDate as string));
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const { networkCode } = req.params;
      const { startDate, endDate, sensorMacs } = req.query;

      const macs: string[] = sensorMacs
      ? Array.isArray(sensorMacs)
        ? sensorMacs as string[]
        : (sensorMacs as string).split(',')
      : [];
          

      res.status(200).json(await getSensorsNetworkOutliers(networkCode, macs, startDate as string, endDate as string));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
