import { ErrorDTO, ErrorDTOToJSON } from "@dto/ErrorDTO";
import { createAppError } from "@services/errorService";
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {

  // Gestione personalizzata per 401
  if (err.status === 401) {
    res.status(401).json({
      name: "UnauthorizedError",
      message: err.message || "Unauthorized access",
      code: 401
    });
    return;
  }

  // Gestione personalizzata per 400
  if(err.status === 400) {
    res.status(400).json({
      name: "BadRequest",
      message: err.message || "Bad request error",
      code: 400
    });
    return;
  }

  let modelError: ErrorDTO = createAppError(err);
  res.status(modelError.code).json(ErrorDTOToJSON(modelError));
}