import { Component, Input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="'btn btn-' + variant + ' btn-size-' + size"
      (click)="onClick.emit()"
    >
      <ng-content />
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    button {
      font-family: var(--font-primary);
      font-weight: 600;
      cursor: pointer;
      border: none;
      border-radius: var(--radius-md);
      transition: background-color 150ms, color 150ms, box-shadow 150ms, opacity 150ms;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      line-height: 1.4;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-size-sm { padding: 6px 12px; font-size: var(--text-body-sm); }
    .btn-size-md { padding: 8px 16px; font-size: var(--text-body); }
    .btn-size-lg { padding: 10px 20px; font-size: var(--text-h3); }
    .btn-primary {
      background: var(--color-accent);
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--color-accent-hover);
    }
    .btn-secondary {
      background: var(--color-surface);
      color: var(--color-ink);
      border: 1px solid var(--color-border);
    }
    .btn-secondary:hover:not(:disabled) {
      background: var(--color-surface-hover);
      border-color: var(--color-accent);
    }
    .btn-ghost {
      background: transparent;
      color: var(--color-ink-secondary);
    }
    .btn-ghost:hover:not(:disabled) {
      background: var(--color-surface-hover);
      color: var(--color-ink);
    }
    .btn-danger {
      background: var(--color-danger);
      color: #fff;
    }
    .btn-danger:hover:not(:disabled) {
      opacity: 0.9;
    }
  `],
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  readonly onClick = output<void>();
}
