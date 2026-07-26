import { Component, Input, output } from '@angular/core';

const MOODS = [
  { value: 'happy', emoji: '😄', label: 'Feliz' },
  { value: 'good', emoji: '🙂', label: 'Bien' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'sad', emoji: '😔', label: 'Triste' },
  { value: 'awful', emoji: '😢', label: 'Horrible' },
] as const;

export type MoodValue = (typeof MOODS)[number]['value'];

@Component({
  selector: 'app-mood-selector',
  standalone: true,
  imports: [],
  template: `
    <div class="mood-selector">
      <label class="mood-label">{{ label }}</label>
      <div class="mood-options">
        @for (mood of moods; track mood.value) {
          <button
            class="mood-btn"
            [class.selected]="value === mood.value"
            [style.--mood-color]="moodColor(mood.value)"
            (click)="selectMood(mood.value)"
            [attr.aria-label]="mood.label"
            [title]="mood.label"
          >
            <span class="mood-emoji">{{ mood.emoji }}</span>
            <span class="mood-label-text">{{ mood.label }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .mood-selector {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .mood-label {
      font-size: var(--text-label);
      font-weight: 600;
      color: var(--color-ink);
    }
    .mood-options {
      display: flex;
      gap: var(--space-sm);
      flex-wrap: wrap;
    }
    .mood-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg);
      cursor: pointer;
      transition: all 150ms;
      min-width: 64px;
    }
    .mood-btn:hover {
      border-color: var(--mood-color, var(--color-accent));
      background: var(--color-surface-hover);
    }
    .mood-btn.selected {
      border-color: var(--mood-color, var(--color-accent));
      background: color-mix(in srgb, var(--mood-color, var(--color-accent)) 10%, var(--color-bg));
    }
    .mood-emoji {
      font-size: 1.4rem;
      line-height: 1;
    }
    .mood-label-text {
      font-size: var(--text-caption);
      color: var(--color-ink-secondary);
      font-weight: 500;
    }
  `],
})
export class MoodSelectorComponent {
  @Input() label = '¿Cómo te sientes?';
  @Input() value = '';
  readonly valueChange = output<string>();

  protected readonly moods = MOODS;

  protected selectMood(val: string): void {
    this.value = val;
    this.valueChange.emit(val);
  }

  protected moodColor(value: string): string {
    const map: Record<string, string> = {
      happy: 'var(--color-mood-happy)',
      good: 'var(--color-mood-good)',
      neutral: 'var(--color-mood-neutral)',
      sad: 'var(--color-mood-sad)',
      awful: 'var(--color-mood-awful)',
    };
    return map[value] ?? 'var(--color-accent)';
  }
}
