import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [],
  template: `
    <div class="spinner-wrapper" [style.--spinner-size]="size + 'px'">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xl) 0;
    }
    .spinner {
      width: var(--spinner-size, 32px);
      height: var(--spinner-size, 32px);
      border: 3px solid var(--color-border);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class SpinnerComponent {
  @Input() size = 32;
}
