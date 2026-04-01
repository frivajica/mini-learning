import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.js";
import { ForbiddenError } from "../utils/AppError.js";

export type UserRole = "USER" | "ADMIN";

export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError("User not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(
        new ForbiddenError(
          `Access denied. Required roles: ${allowedRoles.join(", ")}`,
        ),
      );
    }

    next();
  };
}
