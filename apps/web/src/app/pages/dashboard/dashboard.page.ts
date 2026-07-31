import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';
import { EntriesService } from '../../services/entries.service';
import { PromptsService } from '../../services/prompts.service';
import { InsightsService } from '../../services/insights.service';
import { GoalsService } from '../../services/goals.service';
import { ToastService } from '../../services/toast.service';
import { Entry, Prompt } from '../../interfaces';
import { CardComponent } from '../../shared/card.component';
import { ButtonComponent } from '../../shared/button.component';
import { StreakBadgeComponent } from '../../shared/streak-badge.component';
import { SpinnerComponent } from '../../shared/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, SlicePipe, CardComponent, StreakBadgeComponent, SpinnerComponent, EmptyStateComponent],
  template: `
    @if (loading()) {
      <app-spinner [size]="40" />
    } @else if (error()) {
      <app-empty-state
        icon="⚠️"
        title="Error al cargar"
        message="No pudimos cargar tu tablero. Intenta de nuevo."
        actionLabel="Reintentar"
        (action)="loadData()"
      />
    } @else {
      <div class="dashboard">
        <header class="page-header">
          <h1 class="page-title">Tu día</h1>
          <p class="date-text">{{ todayDate }}</p>
        </header>

        <div class="dashboard-grid">
          <!-- Today's entry status -->
          <app-card>
            <div class="card-row">
              <div>
                <h3>Entrada de hoy</h3>
                @if (todayEntry()) {
                  <p class="entry-preview">{{ todayEntry()!.content | slice:0:120 }}{{ (todayEntry()!.content.length > 120) ? '...' : '' }}</p>
                  <div class="mood-indicator">
                    <span class="mood-emoji">{{ moodEmoji(todayEntry()!.mood) }}</span>
                    <span>{{ moodLabel(todayEntry()!.mood) }}</span>
                  </div>
                  <a routerLink="/entries/{{ todayEntry()!.id }}" class="link">Ver entrada completa →</a>
                } @else {
                  <p class="no-entry">Aún no has escrito nada hoy</p>
                }
              </div>
              <a routerLink="/entries/new" class="cta-btn">
                {{ todayEntry() ? 'Editar' : 'Escribir' }}
              </a>
            </div>
          </app-card>

          <!-- Today's prompt -->
          <app-card>
            <div class="prompt-card">
              <span class="prompt-icon">💡</span>
              <div>
                <p class="prompt-label">{{ prompt()?.category || 'Reflexión' }}</p>
                <p class="prompt-text">{{ prompt()?.text || '¿Qué pasó hoy que valga la pena recordar?' }}</p>
              </div>
            </div>
          </app-card>

          <!-- Quick stats -->
          <app-card>
            <div class="stats-row">
              @if (summary()) {
                <div class="stat">
                  <span class="stat-value">{{ summary()!.totalEntries }}</span>
                  <span class="stat-label">Entradas</span>
                </div>
                <div class="stat">
                  <app-streak-badge [count]="summary()!.currentStreak" />
                  <span class="stat-label">Racha actual</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ summary()!.mostFrequentMood ? moodEmoji(summary()!.mostFrequentMood) : '—' }}</span>
                  <span class="stat-label">Estado común</span>
                </div>
              }
            </div>
          </app-card>

          <!-- Mood distribution -->
          <app-card>
            <h3 class="card-title">Distribución de ánimos</h3>
            @if (moodDist().length > 0) {
              <div class="mood-bars">
                @for (item of moodDist(); track item.mood) {
                  <div class="mood-bar-row">
                    <span class="mood-bar-label">{{ moodEmoji(item.mood) }} {{ moodLabel(item.mood) }}</span>
                    <div class="mood-bar-track">
                      <div class="mood-bar-fill" [style.width.%]="item.percentage" [style.background]="moodColor(item.mood)"></div>
                    </div>
                    <span class="mood-bar-count">{{ item.count }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-secondary">Aún no hay datos suficientes</p>
            }
          </app-card>

          <!-- Tag cloud -->
          <app-card>
            <h3 class="card-title">Etiquetas populares</h3>
            @if (tags().length > 0) {
              <div class="tag-cloud">
                @for (tag of tags(); track tag.id) {
                  <span class="tag-item" [style.--tag-color]="tag.color">
                    {{ tag.name }}
                    <span class="tag-count">{{ tag.entryCount }}</span>
                  </span>
                }
              </div>
            } @else {
              <p class="text-secondary">Sin etiquetas aún</p>
            }
          </app-card>
        </div>
      </div>
    }
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: var(--space-lg); }
    .page-header { margin-bottom: var(--space-sm); }
    .page-title {
      font-family: var(--font-display);
      font-size: var(--text-display);
      font-weight: 500;
      letter-spacing: -0.02em;
      color: var(--color-ink);
    }
    .date-text {
      font-size: var(--text-body-sm);
      color: var(--color-ink-secondary);
      text-transform: capitalize;
      margin-top: 4px;
    }
    .dashboard-grid { display: grid; gap: var(--space-md); grid-template-columns: 1fr 1fr; }
    @media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr; } }
    .card-row { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-md); }
    .card-row h3 { font-size: var(--text-h3); font-weight: 600; color: var(--color-ink); margin-bottom: var(--space-sm); }
    .entry-preview { font-size: var(--text-body-sm); color: var(--color-ink-secondary); margin-bottom: var(--space-sm); line-height: 1.5; }
    .no-entry { font-size: var(--text-body-sm); color: var(--color-ink-tertiary); margin-bottom: var(--space-sm); }
    .mood-indicator { display: flex; align-items: center; gap: 6px; margin-bottom: var(--space-sm); font-size: var(--text-body-sm); color: var(--color-ink-secondary); }
    .mood-emoji { font-size: 1.2rem; }
    .link { font-size: var(--text-body-sm); color: var(--color-accent); font-weight: 500; text-decoration: none; }
    .link:hover { text-decoration: underline; }
    .cta-btn { display: inline-flex; align-items: center; padding: 8px 20px; background: var(--color-accent); color: #fff; border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-body-sm); text-decoration: none; transition: background 150ms; white-space: nowrap; }
    .cta-btn:hover { background: var(--color-accent-hover); }
    .prompt-card { display: flex; gap: var(--space-md); align-items: flex-start; }
    .prompt-icon { font-size: 1.5rem; }
    .prompt-label { font-size: var(--text-caption); font-weight: 600; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .prompt-text { font-size: var(--text-body); color: var(--color-ink); line-height: 1.5; font-style: italic; }
    .stats-row { display: flex; gap: var(--space-lg); justify-content: space-around; flex-wrap: wrap; }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .stat-value { font-size: var(--text-h1); font-weight: 700; color: var(--color-ink); }
    .stat-label { font-size: var(--text-caption); color: var(--color-ink-secondary); }
    .card-title { font-size: var(--text-h3); font-weight: 600; color: var(--color-ink); margin-bottom: var(--space-md); }
    .mood-bars { display: flex; flex-direction: column; gap: var(--space-sm); }
    .mood-bar-row { display: flex; align-items: center; gap: var(--space-sm); }
    .mood-bar-label { min-width: 100px; font-size: var(--text-body-sm); color: var(--color-ink-secondary); }
    .mood-bar-track { flex: 1; height: 8px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden; }
    .mood-bar-fill { height: 100%; border-radius: var(--radius-full); transition: width 300ms; }
    .mood-bar-count { min-width: 24px; text-align: right; font-size: var(--text-caption); color: var(--color-ink-secondary); font-weight: 600; }
    .tag-cloud { display: flex; flex-wrap: wrap; gap: var(--space-sm); }
    .tag-item { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--radius-full); font-size: var(--text-caption); font-weight: 500; background: color-mix(in srgb, var(--tag-color, var(--color-accent)) 15%, var(--color-bg)); color: var(--tag-color, var(--color-accent)); border: 1px solid color-mix(in srgb, var(--tag-color, var(--color-accent)) 30%, transparent); }
    .tag-count { font-size: var(--text-micro); opacity: 0.7; }
    .text-secondary { font-size: var(--text-body-sm); color: var(--color-ink-tertiary); }
  `],
})
export class DashboardPageComponent implements OnInit {
  private readonly entriesService = inject(EntriesService);
  private readonly promptsService = inject(PromptsService);
  private readonly insightsService = inject(InsightsService);
  private readonly goalsService = inject(GoalsService);
  private readonly destroyRef = inject(DestroyRef);

  protected loading = signal(true);
  protected error = signal(false);
  protected todayEntry = signal<Entry | null>(null);
  protected prompt = signal<Prompt | null>(null);
  protected summary = signal<{ totalEntries: number; currentStreak: number; mostFrequentMood: string } | null>(null);
  protected moodDist = signal<{ mood: string; count: number; percentage: number }[]>([]);
  protected tags = signal<{ id: string; name: string; color: string; entryCount?: number }[]>([]);
  protected todayDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.loading.set(true);
    this.error.set(false);

    forkJoin({
      today: this.entriesService.getToday().pipe(catchError(() => of(null))),
      prompt: this.promptsService.getToday().pipe(catchError(() => of(null))),
      summary: this.insightsService.getSummary().pipe(catchError(() => of(null))),
      moodDist: this.insightsService.getMoodDistribution('month').pipe(catchError(() => of([]))),
      tags: this.entriesService.list({ limit: 1 }).pipe(
        catchError(() => of(null)),
      ),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.todayEntry.set(res.today);
        this.prompt.set(res.prompt);
        if (res.summary) {
          this.summary.set({
            totalEntries: (res.summary as any).totalEntries ?? 0,
            currentStreak: (res.summary as any).currentStreak ?? 0,
            mostFrequentMood: (res.summary as any).mostFrequentMood ?? '',
          });
        }
        this.moodDist.set(Array.isArray(res.moodDist) ? res.moodDist : []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });

    // Load tags separately
    import('../../services/tags.service').then(m => {
      const tagsService = inject(m.TagsService);
      tagsService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (tags) => this.tags.set(tags),
        error: () => {},
      });
    });
  }

  protected moodEmoji(mood: string): string {
    const map: Record<string, string> = { happy: '😄', good: '🙂', neutral: '😐', sad: '😔', awful: '😢' };
    return map[mood] ?? '😐';
  }

  protected moodLabel(mood: string): string {
    const map: Record<string, string> = { happy: 'Feliz', good: 'Bien', neutral: 'Neutral', sad: 'Triste', awful: 'Horrible' };
    return map[mood] ?? mood;
  }

  protected moodColor(mood: string): string {
    const map: Record<string, string> = {
      happy: 'var(--color-mood-happy)', good: 'var(--color-mood-good)',
      neutral: 'var(--color-mood-neutral)', sad: 'var(--color-mood-sad)', awful: 'var(--color-mood-awful)',
    };
    return map[mood] ?? 'var(--color-mood-neutral)';
  }
}
