import { Router, Router as RouterType } from "express";
import { z } from "zod";
import * as categoryController from "../controllers/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, authorize } from "../middleware/index.js";

const router: RouterType = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const validate = (schema: z.ZodSchema) => {
  return (req: any, _res: any, next: any) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        Object.assign(new Error("Validation failed"), {
          statusCode: 400,
          errors: result.error.errors,
          isOperational: true,
        }),
      );
    }
    req.body = result.data;
    next();
  };
};

router.get("/", asyncHandler(categoryController.getCategories));

router.get("/:id", asyncHandler(categoryController.getCategory));

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(categorySchema),
  asyncHandler(categoryController.createCategory),
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(categorySchema),
  asyncHandler(categoryController.updateCategory),
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(categoryController.deleteCategory),
);

export default router;
