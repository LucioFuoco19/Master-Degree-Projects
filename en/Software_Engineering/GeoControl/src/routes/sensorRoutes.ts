import { getAllSensors, createSensor, getSensor, updateSensor, deleteSensor } from "@controllers/sensorController";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import { SensorFromJSON } from "@models/dto/Sensor";

import { Router } from "express";

const router = Router({ mergeParams: true });

// Get all sensors (Any authenticated user)
router.get("", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]), async (req, res, next) => {
  try {
    const { networkCode, gatewayMac } = req.params;
    res.status(200).json(await getAllSensors(networkCode, gatewayMac));
  } catch (error) {
    next(error);
  }
});

// Create a new sensor (Admin & Operator)
router.post("", authenticateUser([UserType.Admin, UserType.Operator]), async (req, res, next) => {
  try{
    const { networkCode, gatewayMac } = req.params;
    await createSensor(networkCode, gatewayMac, SensorFromJSON(req.body));  // remember: "empty" fields are set to undefined
    res.status(201).send();
  }catch(error){
    next(error);
  }
});

// Get a specific sensor (Any authenticated user)
router.get("/:sensorMac", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]), async (req, res, next) => {
  try {
    const { networkCode, gatewayMac, sensorMac } = req.params;
    res.status(200).json(await getSensor(networkCode, gatewayMac, sensorMac));
  } catch (error) {
    next(error);
  }
});

// Update a sensor (Admin & Operator)
router.patch("/:sensorMac", authenticateUser([UserType.Admin, UserType.Operator]), async (req, res, next) => {
  try {
    const { networkCode, gatewayMac, sensorMac } = req.params;
    await updateSensor(networkCode, gatewayMac, sensorMac, SensorFromJSON(req.body));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Delete a sensor (Admin & Operator)
router.delete("/:sensorMac", authenticateUser([UserType.Admin, UserType.Operator]), async (req, res, next) => {
  try {
    const { networkCode, gatewayMac, sensorMac } = req.params;
    await deleteSensor(networkCode, gatewayMac, sensorMac);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
