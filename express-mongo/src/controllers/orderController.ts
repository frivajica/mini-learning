import { Response } from "express";
import { OrderService } from "../services/index.js";

const orderService = new OrderService();

export const getOrders = async (req: any, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

  const result = await orderService.getAll(req.user.userId, { page, limit });
  res.status(200).json(result);
};

export const getOrder = async (req: any, res: Response) => {
  const order = await orderService.getById(req.params.id, req.user.userId);
  res.status(200).json(order);
};

export const createOrder = async (req: any, res: Response) => {
  const order = await orderService.create(req.user.userId, req.body.items);
  res.status(201).json(order);
};

export const updateOrderStatus = async (req: any, res: Response) => {
  const order = await orderService.updateStatus(req.params.id, req.body.status);
  res.status(200).json(order);
};
