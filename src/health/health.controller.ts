import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeController } from '@nestjs/swagger';
import { DRIZZLE } from '../database/database.module';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(@Inject(DRIZZLE) private db: any) {}

  @Get('health')
  @ApiOperation({ summary: 'Basic health check' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/ready')
  @ApiOperation({ summary: 'Readiness check (includes dependencies)' })
  async ready() {
    try {
      await this.db.execute('SELECT 1');
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  }
}
