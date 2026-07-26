import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { EntriesService } from '../../services/entries.service';
import { ToastService } from '../../services/toast.service';
import { Entry } from '../../interfaces';
import { CardComponent } from '../../shared/card.component';
import { ButtonComponent } from '../../shared/button.component';
import { TagPillComponent } from '../../shared/tag-pill.component';
import { SpinnerComponent } from '../../shared/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-entry-detail-page',
  standalone: true,
  imports: [DatePipe, CardComponent, ButtonComponent, TagPillComponent, SpinnerComponent, EmptyStateComponent],
  template: `
    @if (loading()) {
      <app-spinner [size]="40" />
    } @else if (error() || !entry()) {
      <app-empty-state icon="🔍" title="Entrada no encontrada" message="No pudimos encontrar esta entrada." actionLabel="Volver al inicio" (action)="router.navigate(['/dashboard'])" />
    } @else {
      <div class="detail-page">
        <div class="detail-header">
          <button class="back-btn" (click)="router.navigate(['/dashboard'])">← Volver</button>
          <app-button variant="primary" (onClick)="router.navigate(['/entries', entry()!.id, 'edit'])">Editar</app-button>
        </div>

        <app-card>
          <div class="entry-mood">
            <span class="mood-emoji">{{ moodEmoji(entry()!.mood) }}</span>
            <span class="mood-label" [style.color]="moodColor(entry()!.mood)">{{ moodLabel(entry()!.mood) }}</span>
          </div>

          <h1 class="entry-date">{{ entry()!.date | date:'fullDate':'':'es' }}</h1>

          @if (entry()!.tags.length > 0) {
            <div class="entry-tags">
              @for (tag of entry()!.tags; track tag.id) {
                <app-tag-pill [name]="tag.name" [color]="tag.color" />
              }
            </div>
          }

          <div class="entry-content">{{ entry()!.content }}</div>

          <div class="entry-timestamps">
            <span>Creado: {{ entry()!.createdAt | date:'short':'':'es' }}</span>
            @if (entry()!.updatedAt !== entry()!.createdAt) {
              <span> · Actualizado: {{ entry()!.updatedAt | date:'short':'':'es' }}</span>
            }
          </div>
        </app-card>
      </div>
    }
  `,
  styles: [`
    .detail-page { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-md); }
    .detail-header { display: flex; justify-content: space-between; align-items: center; }
    .back-btn { background: none; border: none; color: var(--color-ink-secondary); font-size: var(--text-body); cursor: pointer; padding: 4px 8px; border-radius: var(--radius-sm); font-family: var(--font-primary); }
    .back-btn:hover { color: var(--color-ink); background: var(--color-surface-hover); }
    .entry-mood { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); }
    .mood-emoji { font-size: 2rem; }
    .mood-label { font-size: var(--text-h3); font-weight: 600; }
    .entry-date { font-size: var(--text-h1); font-weight: 700; color: var(--color-ink); margin-bottom: var(--space-md); text-transform: capitalize; }
    .entry-tags { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md); }
    .entry-content { font-size: var(--text-body); line-height: 1.8; color: var(--color-ink); white-space: pre-wrap; margin-bottom: var(--space-lg); }
    .entry-timestamps { font-size: var(--text-caption); color: var(--color-ink-tertiary); border-top: 1px solid var(--color-border-light); padding-top: var(--space-md); }
  `],
})
export class EntryDetailPageComponent implements OnInit {
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly entriesService = inject(EntriesService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected entry = signal<Entry | null>(null);
  protected loading = signal(true);
  protected error = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set(true);
      this.loading.set(false);
      return;
    }

    this.entriesService.getById(id).pipe(
      catchError(() => {
        this.error.set(true);
        this.loading.set(false);
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (entry) => {
        this.entry.set(entry);
        this.loading.set(false);
      },
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
