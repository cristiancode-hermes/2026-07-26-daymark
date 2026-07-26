import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PromptsService } from './prompts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('prompts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los prompts activos' })
  @ApiResponse({ status: 200, description: 'Lista de prompts' })
  async findAll() {
    return this.promptsService.findAll();
  }

  @Get('today')
  @ApiOperation({ summary: 'Obtener el prompt del día' })
  @ApiResponse({ status: 200, description: 'Prompt del día (o aleatorio si no hay asignado)' })
  async findToday() {
    return this.promptsService.findToday();
  }

  @Get('random')
  @ApiOperation({ summary: 'Obtener un prompt aleatorio' })
  @ApiResponse({ status: 200, description: 'Prompt aleatorio' })
  async findRandom() {
    return this.promptsService.findRandom();
  }
}
