import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-streak-badge',
  standalone: true,
  imports: [],
  template: `
    <span class="streak-badge">
      <span class="fire">🔥</span>
      <span class="count">{{ count }}</span>
      <span class="unit">{{ unit }}</span>
    </span>
  `,
  styles: [`
    .streak-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: linear-gradient(135deg, #fef3c7, #fed7aa);
      border-radius: var(--radius-full);
      font-weight: 600;
    }
    .fire {
      font-size: 1rem;
      line-height: 1;
    }
    .count {
      font-size: var(--text-body);
      color: #b45309;
    }
    .unit {
      font-size: var(--text-caption);
      color: #92400e;
      font-weight: 500;
    }
  `],
})
export class StreakBadgeComponent {
  @Input() count = 0;
  @Input() unit = 'días';
}
