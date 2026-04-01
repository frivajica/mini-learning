import { Router } from "express";
import { z } from "zod";
import * as productController from "../controllers/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, authorize } from "../middleware/index.js";
const router = Router();
const productSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    category: z.string().min(1),
    tags: z.array(z.string()).optional(),
    stock: z.number().int().min(0).optional(),
});
const reviewSchema = z.object({
    author: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1),
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
router.get("/", asyncHandler(productController.getProducts));
router.get("/:id", asyncHandler(productController.getProduct));
router.post("/", authenticate, authorize("ADMIN"), validate(productSchema), asyncHandler(productController.createProduct));
router.put("/:id", authenticate, authorize("ADMIN"), validate(productSchema), asyncHandler(productController.updateProduct));
router.delete("/:id", authenticate, authorize("ADMIN"), asyncHandler(productController.deleteProduct));
router.post("/:id/reviews", validate(reviewSchema), asyncHandler(productController.addReview));
export default router;
//# sourceMappingURL=productRoutes.js.map