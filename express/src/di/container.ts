import { UserRepository } from '../repositories/userRepository.js';
import { AuthRepository } from '../repositories/authRepository.js';
import { UserService } from '../services/userService.js';
import { AuthService } from '../services/authService.js';
import { UserController } from '../controllers/userController.js';
import { AuthController } from '../controllers/authController.js';
import { IUserRepository } from '../types/interfaces/repositories.js';
import { IAuthRepository } from '../types/interfaces/repositories.js';
import { IUserService } from '../types/interfaces/services.js';
import { IAuthService } from '../types/interfaces/services.js';

const userRepository: IUserRepository = new UserRepository();
const authRepository: IAuthRepository = new AuthRepository();

const userService: IUserService = new UserService(userRepository);
const authService: IAuthService = new AuthService(authRepository, userRepository);

export const createUserController = () => new UserController(userService);
export const createAuthController = () => new AuthController(authService);

export const userRepositorySingleton = userRepository;
export const authRepositorySingleton = authRepository;
export const userServiceSingleton = userService;
export const authServiceSingleton = authService;
