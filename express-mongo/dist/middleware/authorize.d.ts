import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.js";
export type UserRole = "USER" | "ADMIN";
export declare function authorize(...allowedRoles: UserRole[]): (req: AuthRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=authorize.d.ts.map