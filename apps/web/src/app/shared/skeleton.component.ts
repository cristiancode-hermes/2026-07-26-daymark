import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [],
  template: `
    <div class="skeleton" [style.height]="height" [style.width]="width" [style.borderRadius]="rounded ? 'var(--radius-md)' : '0'"></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-hover) 50%, var(--color-surface) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonComponent {
  @Input() height = '16px';
  @Input() width = '100%';
  @Input() rounded = true;
}
