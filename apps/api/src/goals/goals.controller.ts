import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { UpsertGoalDto } from './dto/upsert-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener metas del usuario' })
  @ApiResponse({ status: 200, description: 'Metas configuradas' })
  async getGoal(@CurrentUser() user: User) {
    return this.goalsService.getGoal(user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Crear o actualizar metas' })
  @ApiResponse({ status: 200, description: 'Metas actualizadas' })
  async upsert(@CurrentUser() user: User, @Body() dto: UpsertGoalDto) {
    return this.goalsService.upsert(user.id, dto);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Progreso semanal y de racha' })
  @ApiResponse({ status: 200, description: 'Progreso contra las metas' })
  async getProgress(@CurrentUser() user: User) {
    return this.goalsService.getProgress(user.id);
  }
}
