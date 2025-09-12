import express, { ErrorRequestHandler } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { CONFIG } from "@config";
import { errorHandler } from "@middlewares/errorMiddleware";
import authenticationRouter from "@routes/authenticationRoutes";
import userRouter from "@routes/userRoutes";
import gatewayRouter from "@routes/gatewayRoutes";
import sensorRouter from "@routes/sensorRoutes";
import measurementRouter from "@routes/measurementRoutes";
import networkRouter from "@routes/networkRoutes";
import cors from "cors";
import path from "path";
import { middleware } from "express-openapi-validator";

export const app = express();

app.use(express.json());
app.use(cors());

app.use(
  CONFIG.ROUTES.V1_SWAGGER,
  swaggerUi.serve,
  swaggerUi.setup(YAML.load(CONFIG.SWAGGER_V1_FILE_PATH))
);

// Validator OpenAPI
app.use(
  middleware({
    apiSpec: path.resolve(__dirname, "..", CONFIG.SWAGGER_V1_FILE_PATH),
    validateRequests: true,
    validateResponses: true
  })
);

app.use(CONFIG.ROUTES.V1_AUTH, authenticationRouter);
app.use(CONFIG.ROUTES.V1_USERS, userRouter);
app.use(CONFIG.ROUTES.V1_NETWORKS, networkRouter);
app.use(CONFIG.ROUTES.V1_GATEWAYS, gatewayRouter);
app.use(CONFIG.ROUTES.V1_SENSORS, sensorRouter);
app.use(measurementRouter);

app.use(errorHandler);
