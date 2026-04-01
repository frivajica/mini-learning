import { Response } from "express";
import { ProductService } from "../services/index.js";

const productService = new ProductService();

export const getProducts = async (req: any, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
  const search = req.query.search as string | undefined;
  const category = req.query.category as string | undefined;

  const result = await productService.getAll({ page, limit, search, category });

  res.status(200).json(result);
};

export const getProduct = async (req: any, res: Response) => {
  const product = await productService.getById(req.params.id);
  res.status(200).json(product);
};

export const createProduct = async (req: any, res: Response) => {
  const product = await productService.create(req.body);
  res.status(201).json(product);
};

export const updateProduct = async (req: any, res: Response) => {
  const product = await productService.update(req.params.id, req.body);
  res.status(200).json(product);
};

export const deleteProduct = async (req: any, res: Response) => {
  await productService.delete(req.params.id);
  res.status(204).send();
};

export const addReview = async (req: any, res: Response) => {
  const product = await productService.addReview(req.params.id, req.body);
  res.status(201).json(product);
};
