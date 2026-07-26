import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { TagsService } from '../../services/tags.service';
import { ToastService } from '../../services/toast.service';
import { Tag } from '../../interfaces';
import { CardComponent } from '../../shared/card.component';
import { ButtonComponent } from '../../shared/button.component';
import { ModalComponent } from '../../shared/modal.component';
import { SpinnerComponent } from '../../shared/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { TagPillComponent } from '../../shared/tag-pill.component';

@Component({
  selector: 'app-tags-page',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent, ModalComponent, SpinnerComponent, EmptyStateComponent, TagPillComponent],
  template: `
    @if (loading()) {
      <app-spinner [size]="40" />
    } @else if (error()) {
      <app-empty-state icon="⚠️" title="Error" message="No pudimos cargar las etiquetas." actionLabel="Reintentar" (action)="loadTags()" />
    } @else {
      <div class="tags-page">
        <header class="page-header">
          <h1>Etiquetas</h1>
          <app-button variant="primary" (onClick)="openCreate()">Nueva etiqueta</app-button>
        </header>

        @if (tags().length === 0) {
          <app-empty-state icon="🏷️" title="Sin etiquetas" message="Crea etiquetas para organizar tus entradas." actionLabel="Crear etiqueta" (action)="openCreate()" />
        } @else {
          <div class="tags-list">
            @for (tag of tags(); track tag.id) {
              <app-card>
                <div class="tag-row">
                  <app-tag-pill [name]="tag.name" [color]="tag.color" />
                  <span class="tag-count">{{ tag.entryCount ?? 0 }} entradas</span>
                  <div class="tag-actions">
                    <app-button variant="ghost" size="sm" (onClick)="openEdit(tag)">Editar</app-button>
                    <app-button variant="danger" size="sm" (onClick)="deleteTag(tag.id)">Eliminar</app-button>
                  </div>
                </div>
              </app-card>
            }
          </div>
        }
      </div>
    }

    <!-- Create/Edit Modal -->
    <app-modal [open]="showModal()" [title]="editTag() ? 'Editar etiqueta' : 'Nueva etiqueta'" (onClose)="closeModal()">
      <div class="modal-form">
        <div class="form-group">
          <label for="tagName">Nombre</label>
          <input id="tagName" type="text" [(ngModel)]="tagName" placeholder="Ej: trabajo, personal, salud" class="form-input" />
        </div>
        <div class="form-group">
          <label for="tagColor">Color</label>
          <div class="color-picker">
            @for (c of presetColors; track c) {
              <button
                class="color-swatch"
                [style.background]="c"
                [class.selected]="tagColor === c"
                (click)="tagColor = c"
                [attr.aria-label]="c"
              ></button>
            }
            <input type="color" [(ngModel)]="tagColor" class="color-input" />
          </div>
        </div>
        <div class="modal-actions">
          <app-button variant="ghost" (onClick)="closeModal()">Cancelar</app-button>
          <app-button variant="primary" (onClick)="saveTag()">{{ editTag() ? 'Actualizar' : 'Crear' }}</app-button>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    .tags-page { display: flex; flex-direction: column; gap: var(--space-md); }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-header h1 { font-size: var(--text-h1); font-weight: 700; color: var(--color-ink); }
    .tags-list { display: flex; flex-direction: column; gap: var(--space-sm); }
    .tag-row { display: flex; align-items: center; gap: var(--space-md); }
    .tag-count { font-size: var(--text-body-sm); color: var(--color-ink-secondary); flex: 1; }
    .tag-actions { display: flex; gap: var(--space-xs); }
    .modal-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: var(--text-label); font-weight: 600; color: var(--color-ink); }
    .form-input { font-family: var(--font-primary); font-size: var(--text-body); padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-ink); outline: none; }
    .form-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-muted); }
    .color-picker { display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center; }
    .color-swatch { width: 32px; height: 32px; border-radius: var(--radius-full); border: 2px solid transparent; cursor: pointer; padding: 0; transition: border-color 150ms; }
    .color-swatch.selected { border-color: var(--color-ink); }
    .color-input { width: 32px; height: 32px; border: none; padding: 0; cursor: pointer; border-radius: var(--radius-full); }
    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-sm); margin-top: var(--space-sm); }
  `],
})
export class TagsPageComponent implements OnInit {
  private readonly tagsService = inject(TagsService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected tags = signal<Tag[]>([]);
  protected loading = signal(true);
  protected error = signal(false);
  protected showModal = signal(false);
  protected editTag = signal<Tag | null>(null);
  protected tagName = '';
  protected tagColor = '#c97b4b';

  protected readonly presetColors = [
    '#c97b4b', '#7bc47f', '#7ba4c4', '#c47b8f', '#d4a04a',
    '#a37bc4', '#c47b4b', '#4ba0c4', '#c4a04b', '#7bc4a0',
  ];

  ngOnInit(): void {
    this.loadTags();
  }

  protected loadTags(): void {
    this.loading.set(true);
    this.error.set(false);
    this.tagsService.list().pipe(
      catchError(() => {
        this.error.set(true);
        this.loading.set(false);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (tags) => {
        this.tags.set(tags);
        this.loading.set(false);
      },
    });
  }

  protected openCreate(): void {
    this.editTag.set(null);
    this.tagName = '';
    this.tagColor = '#c97b4b';
    this.showModal.set(true);
  }

  protected openEdit(tag: Tag): void {
    this.editTag.set(tag);
    this.tagName = tag.name;
    this.tagColor = tag.color;
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
    this.editTag.set(null);
  }

  protected saveTag(): void {
    if (!this.tagName.trim()) {
      this.toast.warning('El nombre es obligatorio');
      return;
    }

    const data = { name: this.tagName.trim(), color: this.tagColor };

    if (this.editTag()) {
      this.tagsService.update(this.editTag()!.id, data).pipe(
        catchError(() => {
          this.toast.error('Error al actualizar la etiqueta');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: (updated) => {
          if (updated) {
            this.tags.update(tags => tags.map(t => t.id === updated.id ? updated : t));
            this.toast.success('Etiqueta actualizada');
            this.closeModal();
          }
        },
      });
    } else {
      this.tagsService.create(data).pipe(
        catchError(() => {
          this.toast.error('Error al crear la etiqueta');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: (created) => {
          if (created) {
            this.tags.update(tags => [...tags, created]);
            this.toast.success('Etiqueta creada');
            this.closeModal();
          }
        },
      });
    }
  }

  protected deleteTag(id: string): void {
    if (!confirm('¿Eliminar esta etiqueta?')) return;

    this.tagsService.delete(id).pipe(
      catchError(() => {
        this.toast.error('Error al eliminar la etiqueta');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.tags.update(tags => tags.filter(t => t.id !== id));
        this.toast.success('Etiqueta eliminada');
      },
    });
  }
}
