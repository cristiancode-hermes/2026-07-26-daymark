import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { QueryEntryDto } from './dto/query-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar entradas (paginadas, filtrables)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de entradas' })
  async findAll(
    @CurrentUser() user: User,
    @Query() query: QueryEntryDto,
  ) {
    return this.entriesService.findAll(user.id, query);
  }

  @Get('today')
  @ApiOperation({ summary: 'Obtener la entrada de hoy' })
  @ApiResponse({ status: 200, description: 'Entrada de hoy (o null si no existe)' })
  async findToday(@CurrentUser() user: User) {
    return this.entriesService.findToday(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva entrada' })
  @ApiResponse({ status: 201, description: 'Entrada creada' })
  @ApiResponse({ status: 400, description: 'Ya existe entrada para esta fecha' })
  async create(@CurrentUser() user: User, @Body() dto: CreateEntryDto) {
    return this.entriesService.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener entrada por ID' })
  @ApiResponse({ status: 200, description: 'Entrada encontrada' })
  @ApiResponse({ status: 404, description: 'Entrada no encontrada' })
  async findById(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.entriesService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una entrada' })
  @ApiResponse({ status: 200, description: 'Entrada actualizada' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
  ) {
    return this.entriesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una entrada' })
  @ApiResponse({ status: 200, description: 'Entrada eliminada' })
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.entriesService.remove(id, user.id);
  }
}
