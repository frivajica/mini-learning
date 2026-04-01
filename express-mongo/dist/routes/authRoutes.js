import { Router } from "express";
import { z } from "zod";
import * as authController from "../controllers/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const router = Router();
const registerSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(8),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
const validate = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return next(Object.assign(new Error("Validation failed"), {
                statusCode: 400,
                errors: result.error.errors,
                isOperational: true,
            }));
        }
        req.body = result.data;
        next();
    };
};
router.post("/register", validate(registerSchema), asyncHandler(authController.register));
router.post("/login", validate(loginSchema), asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", asyncHandler(authController.logout));
export default router;
//# sourceMappingURL=authRoutes.js.map