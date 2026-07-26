import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { EntriesService, PaginatedResponse } from '../../services/entries.service';
import { TagsService } from '../../services/tags.service';
import { Entry, Tag } from '../../interfaces';
import { CardComponent } from '../../shared/card.component';
import { ButtonComponent } from '../../shared/button.component';
import { SpinnerComponent } from '../../shared/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { TagPillComponent } from '../../shared/tag-pill.component';

@Component({
  selector: 'app-entry-history-page',
  standalone: true,
  imports: [DatePipe, SlicePipe, FormsModule, CardComponent, SpinnerComponent, EmptyStateComponent, TagPillComponent],
  template: `
    <div class="history-page">
      <header class="page-header">
        <h1>Entradas</h1>
      </header>

      <!-- Filters -->
      <app-card>
        <div class="filters">
          <div class="filter-row">
            <input
              type="text"
              [(ngModel)]="search"
              (input)="onSearch()"
              placeholder="Buscar entradas…"
              class="search-input"
            />
            <select [(ngModel)]="tagFilter" (change)="loadEntries()" class="filter-select">
              <option value="">Todas las etiquetas</option>
              @for (tag of availableTags(); track tag.id) {
                <option [value]="tag.id">{{ tag.name }}</option>
              }
            </select>
          </div>
          <div class="filter-row">
            <label class="date-label">Desde:</label>
            <input type="date" [(ngModel)]="dateFrom" (change)="loadEntries()" class="date-input" />
            <label class="date-label">Hasta:</label>
            <input type="date" [(ngModel)]="dateTo" (change)="loadEntries()" class="date-input" />
          </div>
        </div>
      </app-card>

      @if (loading()) {
        <app-spinner [size]="40" />
      } @else if (entries().length === 0) {
        <app-empty-state
          icon="📝"
          title="Sin entradas"
          message="Aún no has escrito ninguna entrada."
          actionLabel="Escribir primera entrada"
          (action)="router.navigate(['/entries/new'])"
        />
      } @else {
        <!-- Entry list -->
        <div class="entries-list">
          @for (entry of entries(); track entry.id) {
            <app-card>
              <div class="entry-row">
                <div class="entry-main" (click)="router.navigate(['/entries', entry.id])">
                  <div class="entry-header-row">
                    <span class="entry-date">{{ entry.date | date:'fullDate':'':'es' }}</span>
                    <span class="entry-mood">{{ moodEmoji(entry.mood) }}</span>
                  </div>
                  <p class="entry-preview">{{ entry.content | slice:0:150 }}{{ entry.content.length > 150 ? '…' : '' }}</p>
                  @if (entry.tags.length > 0) {
                    <div class="entry-tags">
                      @for (tag of entry.tags; track tag.id) {
                        <app-tag-pill [name]="tag.name" [color]="tag.color" />
                      }
                    </div>
                  }
                </div>
              </div>
            </app-card>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="page() <= 1" (click)="goToPage(page() - 1)">← Anterior</button>
            <span class="page-info">{{ page() }} de {{ totalPages() }}</span>
            <button class="page-btn" [disabled]="page() >= totalPages()" (click)="goToPage(page() + 1)">Siguiente →</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .history-page { display: flex; flex-direction: column; gap: var(--space-md); }
    .page-header h1 { font-size: var(--text-h1); font-weight: 700; color: var(--color-ink); }
    .filters { display: flex; flex-direction: column; gap: var(--space-sm); }
    .filter-row { display: flex; gap: var(--space-sm); align-items: center; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 180px; font-family: var(--font-primary); font-size: var(--text-body); padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-ink); outline: none; }
    .search-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-muted); }
    .filter-select { font-family: var(--font-primary); font-size: var(--text-body-sm); padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-ink); outline: none; cursor: pointer; }
    .date-label { font-size: var(--text-body-sm); color: var(--color-ink-secondary); white-space: nowrap; }
    .date-input { font-family: var(--font-primary); font-size: var(--text-body-sm); padding: 6px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-ink); outline: none; }
    .entries-list { display: flex; flex-direction: column; gap: var(--space-sm); }
    .entry-row { cursor: pointer; }
    .entry-main { display: flex; flex-direction: column; gap: var(--space-sm); }
    .entry-header-row { display: flex; justify-content: space-between; align-items: center; }
    .entry-date { font-size: var(--text-body-sm); font-weight: 600; color: var(--color-ink); text-transform: capitalize; }
    .entry-mood { font-size: 1.2rem; }
    .entry-preview { font-size: var(--text-body-sm); color: var(--color-ink-secondary); line-height: 1.5; }
    .entry-tags { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
    .pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-md); }
    .page-btn { background: none; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 8px 16px; cursor: pointer; font-size: var(--text-body-sm); color: var(--color-ink-secondary); font-family: var(--font-primary); transition: all 150ms; }
    .page-btn:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { font-size: var(--text-body-sm); color: var(--color-ink-secondary); font-weight: 500; }
  `],
})
export class EntryHistoryPageComponent implements OnInit {
  protected readonly router = inject(Router);
  private readonly entriesService = inject(EntriesService);
  private readonly tagsService = inject(TagsService);
  private readonly destroyRef = inject(DestroyRef);

  protected entries = signal<Entry[]>([]);
  protected availableTags = signal<Tag[]>([]);
  protected loading = signal(true);
  protected page = signal(1);
  protected totalPages = signal(1);
  protected search = '';
  protected tagFilter = '';
  protected dateFrom = '';
  protected dateTo = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.tagsService.list().pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({ next: (tags) => this.availableTags.set(tags) });

    this.loadEntries();
  }

  protected loadEntries(): void {
    this.loading.set(true);

    const params: any = {
      page: this.page(),
      limit: 10,
    };
    if (this.search) params.search = this.search;
    if (this.tagFilter) params.tagId = this.tagFilter;
    if (this.dateFrom) params.dateFrom = this.dateFrom;
    if (this.dateTo) params.dateTo = this.dateTo;

    this.entriesService.list(params).pipe(
      catchError(() => of({ data: [], total: 0, page: 1, limit: 10 })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (res) => {
        this.entries.set(res.data ?? []);
        this.totalPages.set(Math.max(1, Math.ceil((res.total ?? 0) / (res.limit ?? 10))));
        this.loading.set(false);
      },
    });
  }

  protected onSearch(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.page.set(1);
      this.loadEntries();
    }, 400);
  }

  protected goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadEntries();
  }

  protected moodEmoji(mood: string): string {
    const map: Record<string, string> = { happy: '😄', good: '🙂', neutral: '😐', sad: '😔', awful: '😢' };
    return map[mood] ?? '😐';
  }
}
