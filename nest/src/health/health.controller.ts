import { Controller, Get, HttpStatus, Inject, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { DRIZZLE } from '../database/database.module';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(@Inject(DRIZZLE) private db: any) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/ready')
  @ApiOperation({ summary: 'Readiness check (includes dependencies)' })
  async ready(@Res() res: Response) {
    const checks: Record<string, { status: string; latency?: number; error?: string }> = {};
    let isHealthy = true;

    const dbStart = Date.now();
    try {
      await this.db.execute('SELECT 1');
      checks.database = { status: 'ok', latency: Date.now() - dbStart };
    } catch (err) {
      isHealthy = false;
      checks.database = { 
        status: 'error', 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }

    const status = isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(status).json({
      status: isHealthy ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks,
    });
  }
}
