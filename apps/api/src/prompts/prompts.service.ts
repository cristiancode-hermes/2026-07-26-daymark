import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from '../entities/prompt.entity';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private readonly promptRepo: Repository<Prompt>,
  ) {}

  async findAll() {
    return this.promptRepo.find({
      where: { active: true },
      order: { category: 'ASC', createdAt: 'ASC' },
    });
  }

  async findToday() {
    const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    let prompt = await this.promptRepo.findOne({
      where: { active: true, dayOfWeek },
      order: { createdAt: 'DESC' },
    });

    // Fallback: random prompt
    if (!prompt) {
      prompt = await this.findRandom();
    }

    return prompt;
  }

  async findRandom() {
    const count = await this.promptRepo.count({ where: { active: true } });
    if (count === 0) return null;

    const randomIndex = Math.floor(Math.random() * count);
    const prompts = await this.promptRepo.find({
      where: { active: true },
      skip: randomIndex,
      take: 1,
    });

    return prompts[0] || null;
  }
}
