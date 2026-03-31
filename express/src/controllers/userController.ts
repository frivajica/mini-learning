import { Response } from 'express';
import { IUserService } from '../types/interfaces/services.js';
import { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/index.js';

export class UserController {
  constructor(private userService: IUserService) {}

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      Math.max(1, parseInt(req.query.limit as string) || config.pagination.defaultLimit),
      config.pagination.maxLimit
    );
    const search = req.query.search as string | undefined;

    const result = await this.userService.getAll({ page, limit, search });

    res.status(200).json(result);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const user = await this.userService.getById(id);

    res.status(200).json(user);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.userService.create(req.body);

    res.status(201).json(user);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const user = await this.userService.update(id, req.body);

    res.status(200).json(user);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    await this.userService.delete(id);

    res.status(204).send();
  });
}
