import { Response } from 'express';
import { IAuthService } from '../types/interfaces/services.js';
import { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class AuthController {
  constructor(private authService: IAuthService) {}

  register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.authService.register(req.body);

    res.status(201).json(result);
  });

  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.authService.login(req.body);

    res.status(200).json(result);
  });

  refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    const tokens = await this.authService.refresh(refreshToken);

    res.status(200).json(tokens);
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    await this.authService.logout(refreshToken);

    res.status(204).send();
  });
}
