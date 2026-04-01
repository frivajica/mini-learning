import { Response } from "express";
import { CategoryService } from "../services/index.js";

const categoryService = new CategoryService();

export const getCategories = async (_req: any, res: Response) => {
  const categories = await categoryService.getAll();
  res.status(200).json(categories);
};

export const getCategory = async (req: any, res: Response) => {
  const category = await categoryService.getById(req.params.id);
  res.status(200).json(category);
};

export const createCategory = async (req: any, res: Response) => {
  const category = await categoryService.create(req.body);
  res.status(201).json(category);
};

export const updateCategory = async (req: any, res: Response) => {
  const category = await categoryService.update(req.params.id, req.body);
  res.status(200).json(category);
};

export const deleteCategory = async (req: any, res: Response) => {
  await categoryService.delete(req.params.id);
  res.status(204).send();
};
