import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  template: `
    <div class="card">
      <ng-content />
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      box-shadow: var(--shadow-1);
      transition: box-shadow 200ms ease-out, border-color 200ms ease-out, transform 200ms ease-out;
    }
    :host-context(body) .card:hover {
      box-shadow: var(--shadow-2);
    }
  `],
})
export class CardComponent {}
