import { Component, inject, signal, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, timer } from 'rxjs';
import { DatePipe } from '@angular/common';
import { EntriesService } from '../../services/entries.service';
import { PromptsService } from '../../services/prompts.service';
import { TagsService } from '../../services/tags.service';
import { ToastService } from '../../services/toast.service';
import { Entry, Prompt, Tag } from '../../interfaces';
import { ButtonComponent } from '../../shared/button.component';
import { CardComponent } from '../../shared/card.component';
import { MoodSelectorComponent } from '../../shared/mood-selector.component';
import { TagPillComponent } from '../../shared/tag-pill.component';
import { SpinnerComponent } from '../../shared/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-entry-editor-page',
  standalone: true,
  imports: [FormsModule, DatePipe, ButtonComponent, CardComponent, MoodSelectorComponent, TagPillComponent, SpinnerComponent, EmptyStateComponent],
  template: `
    @if (loading()) {
      <app-spinner [size]="40" />
    } @else if (error()) {
      <app-empty-state icon="⚠️" title="Error" message="No pudimos cargar la entrada." actionLabel="Volver" (action)="router.navigate(['/dashboard'])" />
    } @else {
      <div class="editor-page">
        <header class="page-header">
          <h1>{{ isEdit ? 'Editar entrada' : 'Nueva entrada' }}</h1>
          <p class="date-text">{{ today | date:'fullDate':'':'es' }}</p>
        </header>

        <!-- Prompt bar -->
        @if (prompt(); as p) {
          <app-card>
            <div class="prompt-bar">
              <span class="prompt-icon">💡</span>
              <div>
                <span class="prompt-label">{{ p.category }}</span>
                <p class="prompt-text">{{ p.text }}</p>
              </div>
            </div>
          </app-card>
        }

        <!-- Mood selector -->
        <app-card>
          <h3 class="section-title">¿Cómo te sientes?</h3>
          <app-mood-selector label="" [value]="selectedMood()" (valueChange)="selectedMood.set($event)" />
        </app-card>

        <!-- Tags -->
        <app-card>
          <h3 class="section-title">Etiquetas</h3>
          <div class="tag-section">
            <div class="tag-pills">
              @for (tag of selectedTags(); track tag.id) {
                <app-tag-pill [name]="tag.name" [color]="tag.color" [showRemove]="true" (remove)="removeTag(tag.id)" />
              }
            </div>
            <div class="tag-input-row">
              <select class="tag-select" #tagSelect (change)="addTag(tagSelect.value); tagSelect.value=''">
                <option value="" disabled selected>Añadir etiqueta…</option>
                @for (tag of availableTags(); track tag.id) {
                  <option value="{{ tag.id }}">{{ tag.name }}</option>
                }
              </select>
            </div>
          </div>
        </app-card>

        <!-- Content editor -->
        <app-card>
          <h3 class="section-title">Reflexión</h3>
          <textarea
            class="content-editor"
            [(ngModel)]="content"
            placeholder="¿Qué pasó hoy? ¿Cómo te sientes? Escribe libremente…"
            rows="10"
          ></textarea>
        </app-card>

        <!-- Actions -->
        <div class="editor-actions">
          <app-button variant="ghost" (onClick)="router.navigate(isEdit ? ['/entries', entryId] : ['/dashboard'])">
            Cancelar
          </app-button>
          <app-button variant="primary" size="lg" [disabled]="saving()" (onClick)="save()">
            @if (saving()) {
              Guardando…
            } @else {
              {{ isEdit ? 'Actualizar' : 'Guardar entrada' }}
            }
          </app-button>
        </div>

        @if (lastSaved()) {
          <p class="auto-save-hint">Guardado automático: {{ lastSaved() | date:'HH:mm:ss' }}</p>
        }
      </div>
    }
  `,
  styles: [`
    .editor-page { display: flex; flex-direction: column; gap: var(--space-md); max-width: 720px; margin: 0 auto; }
    .page-header { margin-bottom: var(--space-sm); }
    .page-header h1 { font-size: var(--text-h1); font-weight: 700; color: var(--color-ink); }
    .date-text { font-size: var(--text-body-sm); color: var(--color-ink-secondary); text-transform: capitalize; }
    .section-title { font-size: var(--text-h3); font-weight: 600; color: var(--color-ink); margin-bottom: var(--space-md); }
    .prompt-bar { display: flex; gap: var(--space-md); align-items: flex-start; }
    .prompt-icon { font-size: 1.3rem; }
    .prompt-label { font-size: var(--text-caption); font-weight: 600; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.05em; }
    .prompt-text { font-size: var(--text-body-sm); color: var(--color-ink-secondary); font-style: italic; margin-top: 2px; }
    .tag-section { display: flex; flex-direction: column; gap: var(--space-sm); }
    .tag-pills { display: flex; flex-wrap: wrap; gap: var(--space-sm); }
    .tag-input-row { display: flex; gap: var(--space-sm); }
    .tag-select {
      font-family: var(--font-primary);
      font-size: var(--text-body-sm);
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg);
      color: var(--color-ink);
      outline: none;
      flex: 1;
      cursor: pointer;
    }
    .tag-select:focus { border-color: var(--color-accent); }
    .content-editor {
      font-family: var(--font-primary);
      font-size: var(--text-body);
      line-height: 1.7;
      width: 100%;
      padding: var(--space-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg);
      color: var(--color-ink);
      outline: none;
      resize: vertical;
      min-height: 200px;
      transition: border-color 150ms;
    }
    .content-editor:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-muted); }
    .content-editor::placeholder { color: var(--color-ink-tertiary); }
    .editor-actions { display: flex; justify-content: flex-end; gap: var(--space-sm); }
    .auto-save-hint { text-align: right; font-size: var(--text-caption); color: var(--color-ink-tertiary); }
  `],
})
export class EntryEditorPageComponent implements OnInit, OnDestroy {
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly entriesService = inject(EntriesService);
  private readonly promptsService = inject(PromptsService);
  private readonly tagsService = inject(TagsService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected today = new Date();
  protected entryId = '';
  protected isEdit = false;
  protected loading = signal(true);
  protected error = signal(false);
  protected saving = signal(false);
  protected content = '';
  protected selectedMood = signal('');
  protected selectedTags = signal<Tag[]>([]);
  protected availableTags = signal<Tag[]>([]);
  protected prompt = signal<Prompt | null>(null);
  protected lastSaved = signal<Date | null>(null);

  private autoSaveTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Load tags
    this.tagsService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (tags) => this.availableTags.set(tags),
    });

    if (id) {
      // Edit mode
      this.isEdit = true;
      this.entryId = id;
      this.entriesService.getById(id).pipe(
        catchError(() => {
          this.error.set(true);
          this.loading.set(false);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: (entry) => {
          if (entry) {
            this.content = entry.content;
            this.selectedMood.set(entry.mood);
            this.selectedTags.set(entry.tags ?? []);
          }
          this.loading.set(false);
        },
      });
    } else {
      this.loading.set(false);
      // Load prompt
      this.promptsService.getToday().pipe(catchError(() => of(null))).subscribe({
        next: (p) => this.prompt.set(p),
      });
    }

    // Auto-save every 30 seconds
    this.autoSaveTimer = setInterval(() => {
      if (this.content && this.selectedMood()) {
        this.autoSave();
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }

  protected addTag(tagId: string): void {
    if (!tagId) return;
    const tag = this.availableTags().find(t => t.id === tagId);
    if (tag && !this.selectedTags().some(t => t.id === tagId)) {
      this.selectedTags.update(tags => [...tags, tag]);
    }
  }

  protected removeTag(tagId: string): void {
    this.selectedTags.update(tags => tags.filter(t => t.id !== tagId));
  }

  protected async save(): Promise<void> {
    if (!this.selectedMood()) {
      this.toast.warning('Selecciona un estado de ánimo');
      return;
    }
    if (!this.content.trim()) {
      this.toast.warning('Escribe algo en tu reflexión');
      return;
    }

    this.saving.set(true);
    try {
      const data = {
        content: this.content,
        mood: this.selectedMood(),
        tagIds: this.selectedTags().map(t => t.id),
      };

      await new Promise<void>((resolve, reject) => {
        if (this.isEdit) {
          this.entriesService.update(this.entryId, data).subscribe({ next: () => resolve(), error: reject });
        } else {
          this.entriesService.create(data).subscribe({ next: () => resolve(), error: reject });
        }
      });

      this.toast.success(this.isEdit ? 'Entrada actualizada' : 'Entrada guardada');
      this.lastSaved.set(new Date());
      this.router.navigate(this.isEdit ? ['/entries', this.entryId] : ['/dashboard']);
    } catch {
      this.toast.error('Error al guardar la entrada');
    } finally {
      this.saving.set(false);
    }
  }

  private autoSave(): void {
    if (!this.selectedMood() || !this.content.trim()) return;

    const data = {
      content: this.content,
      mood: this.selectedMood(),
      tagIds: this.selectedTags().map(t => t.id),
    };

    if (this.isEdit) {
      this.entriesService.update(this.entryId, data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.lastSaved.set(new Date()),
        error: () => {},
      });
    }
  }
}
