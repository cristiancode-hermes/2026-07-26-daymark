import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('mood-distribution')
  @ApiOperation({ summary: 'Distribución de estados de ánimo' })
  @ApiResponse({ status: 200, description: 'Distribución de moods' })
  async getMoodDistribution(@CurrentUser() user: User) {
    return this.insightsService.getMoodDistribution(user.id);
  }

  @Get('weekly-trend')
  @ApiOperation({ summary: 'Tendencia semanal de estados de ánimo' })
  @ApiResponse({ status: 200, description: 'Tendencia de los últimos 7 días' })
  async getWeeklyTrend(@CurrentUser() user: User) {
    return this.insightsService.getWeeklyTrend(user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumen de estadísticas del usuario' })
  @ApiResponse({ status: 200, description: 'Resumen con total, racha, mood más usado' })
  async getSummary(@CurrentUser() user: User) {
    return this.insightsService.getSummary(user.id);
  }
}
