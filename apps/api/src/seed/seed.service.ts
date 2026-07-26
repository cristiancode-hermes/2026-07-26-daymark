import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Entry } from '../entities/entry.entity';
import { Tag } from '../entities/tag.entity';
import { Prompt } from '../entities/prompt.entity';
import { Goal } from '../entities/goal.entity';

interface PromptSeed {
  text: string;
  category: string;
  dayOfWeek: number | null;
}

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);
  private readonly shouldSeed: boolean;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Entry)
    private readonly entryRepo: Repository<Entry>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Prompt)
    private readonly promptRepo: Repository<Prompt>,
    @InjectRepository(Goal)
    private readonly goalRepo: Repository<Goal>,
  ) {
    this.shouldSeed = config.get<string>('SEED_DB', 'false') === 'true';
  }

  async onModuleInit() {
    if (!this.shouldSeed) {
      this.logger.log('Seed skipped (SEED_DB != true)');
      return;
    }

    this.logger.log('Seeding database...');

    // 1. Create demo user
    const demoUser = await this.seedUser();

    // 2. Seed prompts
    await this.seedPrompts();

    // 3. Seed tags
    const tags = await this.seedTags(demoUser);

    // 4. Seed demo entries
    await this.seedEntries(demoUser, tags);

    // 5. Seed goals
    await this.seedGoals(demoUser);

    this.logger.log('Database seeding complete!');
  }

  private async seedUser(): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: 'demo@daymark.app' } });
    if (existing) return existing;

    const passwordHash = await bcrypt.hash('demo123', 10);
    const user = this.userRepo.create({
      email: 'demo@daymark.app',
      name: 'María Demo',
      passwordHash,
    } as any);
    return this.userRepo.save(user) as unknown as User;
  }

  private async seedPrompts() {
    const count = await this.promptRepo.count();
    if (count > 0) {
      this.logger.log(`Prompts already seeded (${count} exist)`);
      return;
    }

    const prompts: PromptSeed[] = [
      // Domingo (0) - Reflexión semanal
      { text: '¿Qué aprendiste esta semana que te gustaría recordar?', category: 'reflexion', dayOfWeek: 0 },
      { text: '¿Cuál fue el momento más significativo de tu semana?', category: 'reflexion', dayOfWeek: 0 },

      // Lunes (1) - Metas y motivación
      { text: '¿Qué meta te gustaría lograr esta semana?', category: 'meta', dayOfWeek: 1 },
      { text: '¿Qué acción concreta tomarás hoy para acercarte a tu objetivo?', category: 'meta', dayOfWeek: 1 },
      { text: '¿Cómo puedes hacer de esta semana una semana productiva?', category: 'meta', dayOfWeek: 1 },

      // Martes (2) - Creatividad
      { text: '¿Qué idea creativa has tenido últimamente?', category: 'creatividad', dayOfWeek: 2 },
      { text: 'Si pudieras expresar cómo te sientes a través del arte, ¿qué crearías?', category: 'creatividad', dayOfWeek: 2 },

      // Miércoles (3) - Gratitud
      { text: '¿Por qué tres cosas estás agradecido hoy?', category: 'gratitud', dayOfWeek: 3 },
      { text: '¿Quién ha hecho tu día mejor hoy y por qué?', category: 'gratitud', dayOfWeek: 3 },

      // Jueves (4) - Crecimiento personal
      { text: '¿Qué hábito te gustaría mejorar y cómo piensas hacerlo?', category: 'crecimiento', dayOfWeek: 4 },
      { text: '¿Qué libro, podcast o conversación te inspiró recientemente?', category: 'crecimiento', dayOfWeek: 4 },

      // Viernes (5) - Balance y autocuidado
      { text: '¿Cómo cuidaste de ti mismo esta semana?', category: 'autocuidado', dayOfWeek: 5 },
      { text: '¿Qué actividad te recarga la energía?', category: 'autocuidado', dayOfWeek: 5 },

      // Sábado (6) - Social & conexiones
      { text: '¿Qué conexión significativa tuviste esta semana?', category: 'social', dayOfWeek: 6 },
      { text: '¿Cómo puedes ser una mejor persona para los que te rodean?', category: 'social', dayOfWeek: 6 },

      // Sin día específico (generales)
      { text: '¿Qué emoción predominó en tu día hoy?', category: 'reflexion', dayOfWeek: null },
      { text: 'Describe tu día en tres palabras.', category: 'reflexion', dayOfWeek: null },
      { text: '¿Qué fue lo mejor y lo peor de tu día?', category: 'reflexion', dayOfWeek: null },
      { text: '¿Qué harías diferente si pudieras volver a vivir hoy?', category: 'reflexion', dayOfWeek: null },
      { text: '¿Qué pensamiento te gustaría soltar antes de dormir?', category: 'reflexion', dayOfWeek: null },
      { text: '¿Qué logro pequeño celebras hoy?', category: 'meta', dayOfWeek: null },
      { text: '¿Qué habilidad te gustaría desarrollar este mes?', category: 'meta', dayOfWeek: null },
      { text: '¿Qué barrera mental te impide avanzar?', category: 'crecimiento', dayOfWeek: null },
      { text: '¿Qué afirmación positiva necesitas escuchar hoy?', category: 'autocuidado', dayOfWeek: null },
      { text: '¿Qué canción describe tu estado de ánimo actual?', category: 'creatividad', dayOfWeek: null },
      { text: 'Escribe una carta breve a tu yo del futuro.', category: 'creatividad', dayOfWeek: null },
      { text: '¿Qué persona marcó una diferencia en tu vida y cómo?', category: 'gratitud', dayOfWeek: null },
      { text: '¿Qué privilegio en tu vida valoras hoy?', category: 'gratitud', dayOfWeek: null },
      { text: '¿Qué límite saludable necesitas establecer?', category: 'autocuidado', dayOfWeek: null },
      { text: '¿Qué acto de bondad hiciste o recibiste hoy?', category: 'social', dayOfWeek: null },
      { text: '¿Cómo te gustaría recordar este año?', category: 'reflexion', dayOfWeek: null },
      { text: '¿Qué pregunta te gustaría responder sobre ti mismo?', category: 'crecimiento', dayOfWeek: null },
    ];

    const entities = prompts.map((p) =>
      this.promptRepo.create({
        text: p.text,
        category: p.category,
        active: true,
        dayOfWeek: p.dayOfWeek,
      }),
    );

    await this.promptRepo.save(entities);
    this.logger.log(`Seeded ${entities.length} prompts`);
  }

  private async seedTags(user: User): Promise<Tag[]> {
    const existing = await this.tagRepo.find({ where: { userId: user.id } });
    if (existing.length > 0) return existing;

    const tagData = [
      { name: 'salud', color: '#FF6B6B' },
      { name: 'trabajo', color: '#4ECDC4' },
      { name: 'familia', color: '#45B7D1' },
      { name: 'amigos', color: '#96CEB4' },
      { name: 'ejercicio', color: '#FFEAA7' },
      { name: 'lectura', color: '#DDA0DD' },
      { name: 'meditación', color: '#98D8C8' },
      { name: 'música', color: '#F7DC6F' },
    ];

    const tags = tagData.map((t) =>
      this.tagRepo.create({ ...t, userId: user.id }),
    );

    return this.tagRepo.save(tags) as unknown as Tag[];
  }

  private async seedEntries(user: User, tags: Tag[]) {
    const existing = await this.entryRepo.count({ where: { userId: user.id } });
    if (existing > 0) {
      this.logger.log(`Entries already seeded (${existing} exist)`);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const moods = [
      'feliz', 'tranquilo', 'motivado', 'cansado', 'estresado',
      'agradecido', 'nostálgico', 'creativo', 'ansioso', 'contento',
    ];

    const contentTemplates: Record<string, string> = {
      feliz: 'Hoy fue un día maravilloso. Me sentí lleno de energía y alegría. Logré completar todas mis tareas y pasé tiempo de calidad con mis seres queridos.',
      tranquilo: 'Día tranquilo y productivo. Disfruté de los pequeños momentos y encontré paz en la rutina diaria. Una taza de té y un buen libro hicieron la tarde perfecta.',
      motivado: 'Me levanté con mucha motivación. Trabajé en mis proyectos personales y siento que estoy avanzando hacia mis metas. ¡Cada día cuenta!',
      cansado: 'Ha sido un día largo y agotador. Necesito descansar y recargar energías para mañana. A veces está bien tomarse un respiro.',
      estresado: 'Día complicado con muchas responsabilidades. El estrés del trabajo me tiene agobiado pero sé que puedo manejarlo. Respirar hondo y seguir adelante.',
      agradecido: 'Hoy me tomé un momento para apreciar todo lo que tengo. La vida es bella incluso en los días simples. Estoy agradecido por mi familia, mi salud y las oportunidades.',
      nostálgico: 'Recordé viejos tiempos hoy. Las fotos del pasado me hicieron sonreír y también reflexionar sobre cuánto he crecido como persona.',
      creativo: 'La inspiración llegó hoy. Pasé horas escribiendo y creando, perdido en el flujo de la creatividad. Necesito más días como este.',
      ansioso: 'Sintiendo un poco de ansiedad por el futuro. Recordarme a mí mismo estar en el presente y confiar en el proceso.',
      contento: 'Un día equilibrado. Nada extraordinario pero todo en su lugar. A veces la felicidad está en la simplicidad de lo cotidiano.',
    };

    const entries = [];
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const mood = moods[i % moods.length];

      entries.push({
        userId: user.id,
        date,
        content: {
          text: contentTemplates[mood] || `Día ${14 - i + 1}: Un día más en el diario. Reflexionando sobre lo vivido.`,
          gratitude: ['Mi familia', 'La salud', 'Un momento de paz'].slice(0, (i % 3) + 1),
        },
        mood,
        tags: [tags[i % tags.length]],
      });
    }

    for (const entryData of entries) {
      const entry = this.entryRepo.create({
        userId: entryData.userId,
        date: entryData.date,
        content: entryData.content,
        mood: entryData.mood,
      } as any);
      const saved = await this.entryRepo.save(entry) as unknown as Entry;
      // Attach tags
      saved.tags = entryData.tags;
      await this.entryRepo.save(saved) as unknown as Entry;
    }

    this.logger.log(`Seeded ${entries.length} demo entries`);
  }

  private async seedGoals(user: User) {
    const existing = await this.goalRepo.findOne({ where: { userId: user.id } });
    if (existing) return;

    const goal = this.goalRepo.create({
      userId: user.id,
      weeklyTarget: 5,
      streakTarget: 7,
    } as any);
    await this.goalRepo.save(goal) as unknown as Goal;
    this.logger.log('Seeded demo goals');
  }
}
