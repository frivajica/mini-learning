import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';

export const CONFIG_SERVICE = 'ConfigService';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(@Inject(CONFIG_SERVICE) private configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    if (status >= 500) {
      this.logger.error({
        status,
        message: typeof message === 'object' ? (message as any).message : message,
        path: request.url,
        method: request.method,
      }, exception instanceof Error ? exception.stack : '');
    } else {
      this.logger.warn({
        status,
        message: typeof message === 'object' ? (message as any).message : message,
        path: request.url,
        method: request.method,
      });
    }

    const responseBody: Record<string, unknown> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (typeof message === 'object') {
      Object.assign(responseBody, message as Record<string, unknown>);
    } else {
      responseBody.message = message;
    }

    if (!isProduction && exception instanceof Error) {
      responseBody.stack = exception.stack;
    }

    response.status(status).json(responseBody);
  }
}
