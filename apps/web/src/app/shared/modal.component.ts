import { Component, Input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  template: `
    @if (open) {
      <div class="overlay" (click)="onClose.emit()">
        <div class="modal" (click)="$event.stopPropagation()" role="dialog" [attr.aria-modal]="true">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="close-btn" (click)="onClose.emit()" aria-label="Cerrar">&times;</button>
          </div>
          <div class="modal-body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-md);
    }
    .modal {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-4);
      max-width: 480px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-lg) var(--space-lg) 0;
    }
    .modal-title {
      font-size: var(--text-h2);
      font-weight: 600;
      color: var(--color-ink);
      margin: 0;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--color-ink-secondary);
      cursor: pointer;
      padding: 4px;
      line-height: 1;
      border-radius: var(--radius-sm);
    }
    .close-btn:hover {
      color: var(--color-ink);
      background: var(--color-surface-hover);
    }
    .modal-body {
      padding: var(--space-lg);
    }
  `],
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  readonly onClose = output<void>();
}
