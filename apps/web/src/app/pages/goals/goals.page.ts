import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { GoalsService, GoalProgress } from '../../services/goals.service';
import { ToastService } from '../../services/toast.service';
import { Goal } from '../../interfaces';
import { CardComponent } from '../../shared/card.component';
import { ButtonComponent } from '../../shared/button.component';
import { StreakBadgeComponent } from '../../shared/streak-badge.component';
import { SpinnerComponent } from '../../shared/spinner.component';

@Component({
  selector: 'app-goals-page',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent, StreakBadgeComponent, SpinnerComponent],
  template: `
    @if (loading()) {
      <app-spinner [size]="40" />
    } @else {
      <div class="goals-page">
        <header class="page-header">
          <h1>Metas</h1>
        </header>

        <!-- Streak progress -->
        <app-card>
          <h3 class="card-title">Racha</h3>
          <div class="streak-section">
            <div class="streak-display">
              <app-streak-badge [count]="progress()?.currentStreak ?? 0" />
              <div class="streak-detail">
                <span>Meta: {{ goals()?.streakTarget ?? 0 }} días</span>
                @if ((progress()?.currentStreak ?? 0) >= (goals()?.streakTarget ?? 0)) {
                  <span class="goal-met">✓ Meta alcanzada</span>
                }
              </div>
            </div>
            <div class="progress-bar-track">
              <div
                class="progress-bar-fill"
                [style.width.%]="Math.min(((progress()?.currentStreak ?? 0) / Math.max(goals()?.streakTarget ?? 1, 1)) * 100, 100)"
              ></div>
            </div>
          </div>
        </app-card>

        <!-- Weekly progress -->
        <app-card>
          <h3 class="card-title">Progreso semanal</h3>
          <div class="weekly-section">
            <div class="weekly-header">
              <span>{{ progress()?.weeklyEntries ?? 0 }} / {{ goals()?.weeklyTarget ?? 0 }} entradas esta semana</span>
              @if (progress()?.weeklyComplete) {
                <span class="goal-met">✓ Completado</span>
              }
            </div>
            <div class="weekly-checkmarks">
              @for (i of getRange(goals()?.weeklyTarget ?? 7); track i) {
                <div class="checkmark" [class.filled]="i < (progress()?.weeklyEntries ?? 0)">
                  {{ i < (progress()?.weeklyEntries ?? 0) ? '✓' : '&nbsp;' }}
                </div>
              }
            </div>
          </div>
        </app-card>

        <!-- Goal settings -->
        <app-card>
          <h3 class="card-title">Configurar metas</h3>
          <form (ngSubmit)="saveGoals()" class="goals-form">
            <div class="form-group">
              <label for="weeklyTarget">Meta semanal de entradas</label>
              <input
                id="weeklyTarget"
                type="number"
                [(ngModel)]="formWeeklyTarget"
                name="weeklyTarget"
                min="1"
                max="14"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="streakTarget">Meta de racha (días)</label>
              <input
                id="streakTarget"
                type="number"
                [(ngModel)]="formStreakTarget"
                name="streakTarget"
                min="1"
                max="365"
                class="form-input"
              />
            </div>
            <app-button type="submit" [disabled]="saving()" variant="primary">
              {{ saving() ? 'Guardando…' : 'Guardar metas' }}
            </app-button>
          </form>
        </app-card>
      </div>
    }
  `,
  styles: [`
    .goals-page { display: flex; flex-direction: column; gap: var(--space-md); max-width: 600px; }
    .page-header h1 { font-size: var(--text-h1); font-weight: 700; color: var(--color-ink); }
    .card-title { font-size: var(--text-h3); font-weight: 600; color: var(--color-ink); margin-bottom: var(--space-md); }
    .streak-section { display: flex; flex-direction: column; gap: var(--space-md); }
    .streak-display { display: flex; align-items: center; gap: var(--space-md); }
    .streak-detail { display: flex; flex-direction: column; gap: 2px; font-size: var(--text-body-sm); color: var(--color-ink-secondary); }
    .goal-met { color: var(--color-success); font-weight: 600; font-size: var(--text-caption); }
    .progress-bar-track { height: 12px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden; }
    .progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--color-mood-happy), var(--color-accent)); border-radius: var(--radius-full); transition: width 300ms; }
    .weekly-section { display: flex; flex-direction: column; gap: var(--space-md); }
    .weekly-header { display: flex; align-items: center; gap: var(--space-sm); font-size: var(--text-body-sm); color: var(--color-ink-secondary); }
    .weekly-checkmarks { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
    .checkmark { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); font-size: var(--text-body); font-weight: 700; background: var(--color-border-light); color: var(--color-ink-tertiary); border: 1px solid var(--color-border); }
    .checkmark.filled { background: var(--color-success); color: #fff; border-color: var(--color-success); }
    .goals-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: var(--text-label); font-weight: 600; color: var(--color-ink); }
    .form-input { font-family: var(--font-primary); font-size: var(--text-body); padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-ink); outline: none; max-width: 120px; }
    .form-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-muted); }
  `],
})
export class GoalsPageComponent implements OnInit {
  private readonly goalsService = inject(GoalsService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected loading = signal(true);
  protected saving = signal(false);
  protected goals = signal<Goal | null>(null);
  protected progress = signal<GoalProgress | null>(null);
  protected formWeeklyTarget = 5;
  protected formStreakTarget = 7;

  // Expose Math for template
  protected readonly Math = Math;

  ngOnInit(): void {
    this.loading.set(true);

    this.goalsService.get().pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (g) => {
        if (g) {
          this.goals.set(g);
          this.formWeeklyTarget = g.weeklyTarget;
          this.formStreakTarget = g.streakTarget;
        }
        this.loading.set(false);
      },
    });

    this.goalsService.getProgress().pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (p) => {
        if (p) this.progress.set(p);
      },
    });
  }

  protected getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  protected saveGoals(): void {
    this.saving.set(true);
    const data: Goal = {
      weeklyTarget: Math.max(1, this.formWeeklyTarget),
      streakTarget: Math.max(1, this.formStreakTarget),
    };

    this.goalsService.update(data).pipe(
      catchError(() => {
        this.toast.error('Error al guardar las metas');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (g) => {
        if (g) {
          this.goals.set(g);
          this.toast.success('Metas actualizadas');
        }
        this.saving.set(false);
      },
    });
  }
}
