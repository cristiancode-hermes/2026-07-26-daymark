import { Component, Input, output } from '@angular/core';

@Component({
  selector: 'app-tag-pill',
  standalone: true,
  imports: [],
  template: `
    <span class="tag-pill" [style.--tag-color]="color">
      {{ name }}
      @if (showRemove) {
        <button class="remove-btn" (click)="remove.emit()" aria-label="Eliminar etiqueta">&times;</button>
      }
    </span>
  `,
  styles: [`
    .tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      font-size: var(--text-caption);
      font-weight: 500;
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--tag-color, var(--color-accent)) 15%, var(--color-bg));
      color: var(--tag-color, var(--color-accent));
      border: 1px solid color-mix(in srgb, var(--tag-color, var(--color-accent)) 30%, transparent);
    }
    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      color: inherit;
      opacity: 0.6;
      padding: 0;
      margin-left: 2px;
    }
    .remove-btn:hover {
      opacity: 1;
    }
  `],
})
export class TagPillComponent {
  @Input() name = '';
  @Input() color = 'var(--color-accent)';
  @Input() showRemove = false;
  readonly remove = output<void>();
}
