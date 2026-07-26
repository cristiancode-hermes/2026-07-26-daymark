import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async findAll(userId: string) {
    const tags = await this.tagsRepository.find({
      where: { userId },
      relations: { entries: true },
    });
    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      entryCount: tag.entries?.length || 0,
      userId: tag.userId,
    }));
  }

  async create(userId: string, dto: CreateTagDto) {
    const tag = this.tagsRepository.create({
      name: dto.name,
      color: dto.color || null,
      userId,
    }) as unknown as Tag;
    return this.tagsRepository.save(tag) as unknown as Tag;
  }

  async update(id: string, userId: string, dto: UpdateTagDto) {
    const tag = await this.tagsRepository.findOne({ where: { id, userId } });
    if (!tag) return null;
    if (dto.name !== undefined) tag.name = dto.name;
    if (dto.color !== undefined) tag.color = dto.color;
    return this.tagsRepository.save(tag) as unknown as Tag;
  }

  async remove(id: string, userId: string) {
    const tag = await this.tagsRepository.findOne({ where: { id, userId } });
    if (!tag) return false;
    await this.tagsRepository.remove(tag);
    return true;
  }
}
