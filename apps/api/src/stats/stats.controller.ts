import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('streak')
  @ApiOperation({ summary: 'Racha actual y máxima de entradas consecutivas' })
  @ApiResponse({ status: 200, description: 'Datos de racha' })
  async getStreak(@CurrentUser() user: User) {
    return this.statsService.getStreak(user.id);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Calendario de entradas por mes' })
  @ApiQuery({ name: 'year', required: true, type: Number, example: 2026 })
  @ApiQuery({ name: 'month', required: true, type: Number, example: 7 })
  @ApiResponse({ status: 200, description: 'Datos del calendario mensual' })
  async getCalendar(
    @CurrentUser() user: User,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    return this.statsService.getCalendar(user.id, y, m);
  }
}
