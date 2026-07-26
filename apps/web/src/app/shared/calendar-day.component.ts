import { Component, Input, output } from '@angular/core';

const MOOD_COLORS: Record<string, string> = {
  happy: 'var(--color-mood-happy)',
  good: 'var(--color-mood-good)',
  neutral: 'var(--color-mood-neutral)',
  sad: 'var(--color-mood-sad)',
  awful: 'var(--color-mood-awful)',
};

@Component({
  selector: 'app-calendar-day',
  standalone: true,
  imports: [],
  template: `
    <button
      class="day-cell"
      [class.has-entry]="hasEntry"
      [class.empty]="!day"
      [class.today]="isToday"
      [class.selected]="isSelected"
      (click)="select.emit()"
      [disabled]="!day"
    >
      @if (day) {
        <span class="day-number">{{ day }}</span>
        @if (hasEntry && mood) {
          <span class="mood-dot" [style.--dot-color]="moodColor(mood)"></span>
        }
      }
    </button>
  `,
  styles: [`
    .day-cell {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      aspect-ratio: 1;
      border: none;
      background: var(--color-bg);
      border-radius: var(--radius-sm);
      cursor: pointer;
      padding: 2px;
      transition: background 150ms;
      gap: 2px;
    }
    .day-cell:hover:not(:disabled) {
      background: var(--color-surface-hover);
    }
    .day-cell.today {
      background: var(--color-accent-muted);
      font-weight: 700;
    }
    .day-cell.selected {
      box-shadow: 0 0 0 2px var(--color-accent);
    }
    .day-cell:disabled {
      cursor: default;
    }
    .day-number {
      font-size: var(--text-body-sm);
      font-weight: 500;
      color: var(--color-ink);
      line-height: 1;
    }
    .mood-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--dot-color, var(--color-mood-neutral));
    }
  `],
})
export class CalendarDayComponent {
  @Input() day: number | null = null;
  @Input() mood = '';
  @Input() hasEntry = false;
  @Input() isToday = false;
  @Input() isSelected = false;
  readonly select = output<void>();

  protected moodColor(value: string): string {
    return MOOD_COLORS[value] ?? 'var(--color-mood-neutral)';
  }
}
