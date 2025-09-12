import { createGateway, deleteGateway, getAllGateways, getGateway, updateGateway } from "@controllers/gatewayController";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import { GatewayFromJSON } from "@models/dto/Gateway";
import AppError from "@models/errors/AppError";
import { Router } from "express";

const router = Router({ mergeParams: true });

// Get all gateways (Any authenticated user)
router.get("", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]), async (req, res, next) => {
  try {
    const { networkCode } = req.params;
    res.status(200).json(await getAllGateways(networkCode));
  } catch (error) {
    next(error);
  }
});

// Create a new gateway (Admin & Operator)
router.post("", authenticateUser([UserType.Admin, UserType.Operator]), async (req, res, next) => {
  try {
    const { networkCode } = req.params;
    await createGateway(networkCode, GatewayFromJSON(req.body)); // remember: "empty" fields are set to undefined
    res.status(201).send();
  } catch (error) {
    next(error);
  }
});

// Get a specific gateway (Any authenticated user)
router.get("/:gatewayMac", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]), async (req, res, next) => {
  try {
    const { networkCode, gatewayMac } = req.params;
    res.status(200).json(await getGateway(networkCode, gatewayMac));
  } catch (error) {
    next(error);
  }
});

// Update a gateway (Admin & Operator)
router.patch("/:gatewayMac", authenticateUser([UserType.Admin, UserType.Operator]), async (req, res, next) => {
  try {
    const { networkCode, gatewayMac } = req.params;
    await updateGateway(networkCode, gatewayMac, GatewayFromJSON(req.body));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Delete a gateway (Admin & Operator)
router.delete("/:gatewayMac", authenticateUser([UserType.Admin, UserType.Operator]), async (req, res, next) => {
  try {
    const { networkCode, gatewayMac } = req.params;
    await deleteGateway(networkCode, gatewayMac);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
