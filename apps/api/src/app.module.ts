import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EntriesModule } from './entries/entries.module';
import { TagsModule } from './tags/tags.module';
import { PromptsModule } from './prompts/prompts.module';
import { InsightsModule } from './insights/insights.module';
import { GoalsModule } from './goals/goals.module';
import { StatsModule } from './stats/stats.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DATABASE_PATH', 'data/daymark.sqlite'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    EntriesModule,
    TagsModule,
    PromptsModule,
    InsightsModule,
    GoalsModule,
    StatsModule,
    SeedModule,
  ],
})
export class AppModule {}
