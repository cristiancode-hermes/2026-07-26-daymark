import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { InsightsService, MoodDistribution, WeeklyTrend } from '../../services/insights.service';
import { CardComponent } from '../../shared/card.component';
import { ButtonComponent } from '../../shared/button.component';
import { SpinnerComponent } from '../../shared/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-insights-page',
  standalone: true,
  imports: [SlicePipe, CardComponent, SpinnerComponent, EmptyStateComponent],
  template: `
    @if (loading()) {
      <app-spinner [size]="40" />
    } @else if (error()) {
      <app-empty-state icon="⚠️" title="Error" message="No pudimos cargar los insights." actionLabel="Reintentar" (action)="loadData()" />
    } @else {
      <div class="insights-page">
        <header class="page-header">
          <h1>Insights</h1>
          <div class="period-selector">
            @for (p of periods; track p.value) {
              <button class="period-btn" [class.active]="period() === p.value" (click)="setPeriod(p.value)">{{ p.label }}</button>
            }
          </div>
        </header>

        <!-- Summary cards -->
        <div class="summary-grid">
          <app-card>
            <div class="summary-card">
              <span class="summary-icon">📝</span>
              <span class="summary-value">{{ summary()?.totalEntries ?? 0 }}</span>
              <span class="summary-label">Total entradas</span>
            </div>
          </app-card>
          <app-card>
            <div class="summary-card">
              <span class="summary-icon">🔥</span>
              <span class="summary-value">{{ summary()?.currentStreak ?? 0 }}</span>
              <span class="summary-label">Racha actual</span>
            </div>
          </app-card>
          <app-card>
            <div class="summary-card">
              <span class="summary-icon">🏆</span>
              <span class="summary-value">{{ summary()?.longestStreak ?? 0 }}</span>
              <span class="summary-label">Mejor racha</span>
            </div>
          </app-card>
          <app-card>
            <div class="summary-card">
              <span class="summary-icon">{{ summary()?.mostFrequentMood ? moodEmoji(summary()!.mostFrequentMood!) : '—' }}</span>
              <span class="summary-value">{{ summary()?.mostFrequentMood ? moodLabel(summary()!.mostFrequentMood!) : '—' }}</span>
              <span class="summary-label">Estado más común</span>
            </div>
          </app-card>
        </div>

        <!-- Mood distribution bars (SVG) -->
        <app-card>
          <h3 class="card-title">Distribución de ánimos</h3>
          @if (moodDist().length > 0) {
            <div class="chart-container">
              <svg [attr.viewBox]="'0 0 400 ' + (moodDist().length * 40 + 20)" class="bar-chart">
                @for (item of moodDist(); track item.mood; let i = $index) {
                  <g>
                    <text
                      x="0"
                      [attr.y]="i * 40 + 25"
                      font-size="13"
                      fill="var(--color-ink-secondary)"
                      font-family="var(--font-primary)"
                    >{{ moodEmoji(item.mood) }} {{ moodLabel(item.mood) }}</text>
                    <rect
                      x="140"
                      [attr.y]="i * 40 + 8"
                      [attr.width]="Math.max(item.percentage * 2.2, 4)"
                      height="24"
                      [attr.fill]="moodColor(item.mood)"
                      rx="4"
                    />
                    <text
                      x="145"
                      [attr.y]="i * 40 + 25"
                      font-size="12"
                      fill="#fff"
                      font-weight="600"
                      font-family="var(--font-primary)"
                    >{{ item.count }}</text>
                  </g>
                }
              </svg>
            </div>
          } @else {
            <p class="text-secondary">Sin datos en este período</p>
          }
        </app-card>

        <!-- Weekly trend -->
        <app-card>
          <h3 class="card-title">Tendencia semanal</h3>
          @if (weeklyTrend().length > 0) {
            <div class="chart-container">
              @let maxVal = getMaxMoodValue();
              @let padding = 30;
              @let chartW = 370;
              @let chartH = 120;
              @let stepX = chartW / Math.max(weeklyTrend().length - 1, 1);
              <svg [attr.viewBox]="'0 0 400 160'" class="line-chart">
                @for (item of weeklyTrend(); track item.date; let i = $index) {
                  @let x = padding + i * stepX;
                  @let y = chartH + 20 - (item.moodValue / (maxVal + 1)) * chartH;
                  <!-- Point -->
                  <circle [attr.cx]="x" [attr.cy]="y" r="5" [attr.fill]="moodColor(item.mood)" />
                  <!-- Label -->
                  <text [attr.x]="x" [attr.y]="chartH + 35" font-size="10" text-anchor="middle" fill="var(--color-ink-tertiary)" font-family="var(--font-primary)">
                    {{ item.date | slice:5:10 }}
                  </text>
                  @if (i > 0) {
                    @let prevItem = weeklyTrend()[i - 1];
                    @let prevX = padding + (i - 1) * stepX;
                    @let prevY = chartH + 20 - (prevItem.moodValue / (maxVal + 1)) * chartH;
                    <line [attr.x1]="prevX" [attr.y1]="prevY" [attr.x2]="x" [attr.y2]="y" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" />
                  }
                }
              </svg>
            </div>
          } @else {
            <p class="text-secondary">Sin datos suficientes para la tendencia</p>
          }
        </app-card>
      </div>
    }
  `,
  styles: [`
    .insights-page { display: flex; flex-direction: column; gap: var(--space-md); }
    .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); }
    .page-header h1 { font-size: var(--text-h1); font-weight: 700; color: var(--color-ink); }
    .period-selector { display: flex; gap: 4px; background: var(--color-surface); border-radius: var(--radius-md); padding: 3px; border: 1px solid var(--color-border); }
    .period-btn { padding: 6px 12px; font-size: var(--text-body-sm); font-weight: 500; background: none; border: none; border-radius: var(--radius-sm); cursor: pointer; color: var(--color-ink-secondary); transition: all 150ms; font-family: var(--font-primary); }
    .period-btn.active { background: var(--color-bg); color: var(--color-ink); box-shadow: var(--shadow-1); }
    .period-btn:hover:not(.active) { color: var(--color-ink); }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-sm); }
    @media (max-width: 768px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
    .summary-card { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; }
    .summary-icon { font-size: 1.5rem; }
    .summary-value { font-size: var(--text-h1); font-weight: 700; color: var(--color-ink); }
    .summary-label { font-size: var(--text-caption); color: var(--color-ink-secondary); font-weight: 500; }
    .card-title { font-size: var(--text-h3); font-weight: 600; color: var(--color-ink); margin-bottom: var(--space-md); }
    .chart-container { width: 100%; overflow-x: auto; }
    .bar-chart, .line-chart { width: 100%; height: auto; }
    .text-secondary { font-size: var(--text-body-sm); color: var(--color-ink-tertiary); }
  `],
})
export class InsightsPageComponent implements OnInit {
  private readonly insightsService = inject(InsightsService);
  private readonly destroyRef = inject(DestroyRef);

  protected loading = signal(true);
  protected error = signal(false);
  protected period = signal<'week' | 'month' | 'year'>('month');
  protected moodDist = signal<MoodDistribution[]>([]);
  protected weeklyTrend = signal<WeeklyTrend[]>([]);
  protected summary = signal<{ totalEntries: number; currentStreak: number; longestStreak: number; mostFrequentMood: string | null } | null>(null);

  protected readonly periods = [
    { value: 'week' as const, label: 'Semana' },
    { value: 'month' as const, label: 'Mes' },
    { value: 'year' as const, label: 'Año' },
  ];

  // Expose Math for template
  protected readonly Math = Math;

  ngOnInit(): void {
    this.loadData();
  }

  protected setPeriod(p: 'week' | 'month' | 'year'): void {
    this.period.set(p);
    this.loadMoodDist();
  }

  protected loadData(): void {
    this.loading.set(true);
    this.error.set(false);

    this.insightsService.getSummary().pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (s) => {
        if (s) {
          this.summary.set({
            totalEntries: (s as any).totalEntries ?? 0,
            currentStreak: (s as any).currentStreak ?? 0,
            longestStreak: (s as any).longestStreak ?? 0,
            mostFrequentMood: (s as any).mostFrequentMood ?? null,
          });
        }
      },
    });

    this.loadMoodDist();

    this.insightsService.getWeeklyTrend().pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (trend) => {
        this.weeklyTrend.set(trend);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  protected getMaxMoodValue(): number {
    const vals = this.weeklyTrend().map(w => w.moodValue);
    return Math.max(...vals, 1);
  }

  private loadMoodDist(): void {
    this.insightsService.getMoodDistribution(this.period()).pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (dist) => this.moodDist.set(dist),
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
