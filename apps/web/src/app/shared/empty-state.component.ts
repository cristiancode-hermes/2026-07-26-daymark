import { Component, Input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [],
  template: `
    <div class="empty-state">
      <div class="empty-icon">{{ icon }}</div>
      <h3 class="empty-title">{{ title }}</h3>
      @if (message) {
        <p class="empty-message">{{ message }}</p>
      }
      @if (actionLabel) {
        <button class="action-btn" (click)="action.emit()">{{ actionLabel }}</button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-2xl) var(--space-lg);
      text-align: center;
    }
    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: var(--space-md);
      line-height: 1;
    }
    .empty-title {
      font-size: var(--text-h3);
      font-weight: 600;
      color: var(--color-ink);
      margin-bottom: var(--space-sm);
    }
    .empty-message {
      font-size: var(--text-body);
      color: var(--color-ink-secondary);
      max-width: 360px;
      margin-bottom: var(--space-lg);
    }
    .action-btn {
      background: var(--color-accent);
      color: #fff;
      border: none;
      padding: 8px 20px;
      font-size: var(--text-body);
      font-weight: 600;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background 150ms;
      font-family: var(--font-primary);
    }
    .action-btn:hover {
      background: var(--color-accent-hover);
    }
  `],
})
export class EmptyStateComponent {
  @Input() icon = '📝';
  @Input() title = 'Sin contenido';
  @Input() message = '';
  @Input() actionLabel = '';
  readonly action = output<void>();
}
