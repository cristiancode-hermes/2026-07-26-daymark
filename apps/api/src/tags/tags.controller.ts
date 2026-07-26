import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('tags')
@Controller('tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.tagsService.findAll(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTagDto) {
    return this.tagsService.create(userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(id, userId, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.tagsService.remove(id, userId);
    return { deleted: true };
  }
}
