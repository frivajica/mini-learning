import { Router } from "express";
import { z } from "zod";
import * as orderController from "../controllers/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, authorize } from "../middleware/index.js";
const router = Router();
const orderSchema = z.object({
    items: z
        .array(z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
    }))
        .min(1),
});
const statusSchema = z.object({
    status: z.enum([
        "PENDING",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
    ]),
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
router.get("/", authenticate, asyncHandler(orderController.getOrders));
router.get("/:id", authenticate, asyncHandler(orderController.getOrder));
router.post("/", authenticate, validate(orderSchema), asyncHandler(orderController.createOrder));
router.put("/:id/status", authenticate, authorize("ADMIN"), validate(statusSchema), asyncHandler(orderController.updateOrderStatus));
export default router;
//# sourceMappingURL=orderRoutes.js.map