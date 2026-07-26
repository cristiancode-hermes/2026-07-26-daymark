import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Raw } from 'typeorm';
import { Entry } from '../entities/entry.entity';
import { Tag } from '../entities/tag.entity';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { QueryEntryDto } from './dto/query-entry.dto';

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(Entry)
    private readonly entryRepo: Repository<Entry>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async findAll(userId: string, query: QueryEntryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.mood) {
      where.mood = query.mood;
    }

    if (query.from && query.to) {
      where.date = Between(new Date(query.from), new Date(query.to));
    } else if (query.from) {
      where.date = Raw((alias) => `${alias} >= :from`, { from: new Date(query.from) });
    } else if (query.to) {
      where.date = Raw((alias) => `${alias} <= :to`, { to: new Date(query.to) });
    }

    // If filtering by tagId, we need a different approach
    if (query.tagId) {
      const [entries, total] = await this.entryRepo.findAndCount({
        where: { userId },
        relations: { tags: true },
        skip,
        take: limit,
        order: { date: 'DESC' },
      });

      const filtered = entries.filter((e) =>
        e.tags?.some((t) => t.id === query.tagId),
      );

      return {
        data: filtered,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }

    const [data, total] = await this.entryRepo.findAndCount({
      where,
      relations: { tags: true },
      skip,
      take: limit,
      order: { date: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await this.entryRepo.findOne({
      where: {
        userId,
        date: Raw((alias) => `date(${alias}) = date(:today)`, {
          today: today.toISOString(),
        }),
      },
      relations: { tags: true },
    });

    return entry;
  }

  async findById(id: string, userId: string) {
    const entry = await this.entryRepo.findOne({
      where: { id, userId },
      relations: { tags: true },
    });

    if (!entry) {
      throw new NotFoundException('Entrada no encontrada');
    }

    return entry;
  }

  async create(userId: string, dto: CreateEntryDto) {
    // Check if entry already exists for this date
    const existing = await this.entryRepo.findOne({
      where: {
        userId,
        date: new Date(dto.date),
      },
    });

    if (existing) {
      throw new BadRequestException('Ya existe una entrada para esta fecha');
    }

    const entry = this.entryRepo.create({
      userId,
      date: new Date(dto.date),
      content: (dto.content ?? null) as any,
      mood: dto.mood ?? null,
    } as any);

    const saved = await this.entryRepo.save(entry) as unknown as Entry;

    // Attach tags if provided
    if (dto.tagIds && dto.tagIds.length > 0) {
      const tags = await this.tagRepo.find({
        where: dto.tagIds.map((id) => ({ id, userId }) as any),
      });
      saved.tags = tags;
      await this.entryRepo.save(saved) as unknown as Entry;
    }

    return this.findById(saved.id, userId);
  }

  async update(id: string, userId: string, dto: UpdateEntryDto) {
    const entry = await this.findById(id, userId);

    if (dto.content !== undefined) {
      entry.content = dto.content as any;
    }
    if (dto.mood !== undefined) {
      entry.mood = dto.mood;
    }

    if (dto.tagIds !== undefined) {
      const tags = await this.tagRepo.find({
        where: dto.tagIds.map((tagId) => ({ id: tagId, userId }) as any),
      });
      entry.tags = tags;
    }

    await this.entryRepo.save(entry) as unknown as Entry;

    return this.findById(id, userId);
  }

  async remove(id: string, userId: string) {
    const entry = await this.findById(id, userId);
    await this.entryRepo.remove(entry);
    return { deleted: true };
  }
}
