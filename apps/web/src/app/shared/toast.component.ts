import { Component } from '@angular/core';
import { ToastService, ToastMessage } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [],
  template: `
    <div class="toast-container">
      @for (msg of toastService.messages(); track msg.id) {
        <div class="toast toast-{{ msg.type }}" (click)="toastService.dismiss(msg.id)">
          <span class="toast-icon">{{ iconMap[msg.type] }}</span>
          <span class="toast-text">{{ msg.text }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: var(--space-lg);
      right: var(--space-lg);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 12px 16px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-3);
      cursor: pointer;
      pointer-events: auto;
      animation: slideIn 250ms ease-out;
      max-width: 360px;
      font-size: var(--text-body-sm);
      font-weight: 500;
    }
    .toast-icon { font-size: 1.1rem; }
    .toast-text { color: #fff; }
    .toast-success { background: var(--color-success); }
    .toast-error { background: var(--color-danger); }
    .toast-info { background: var(--color-info); }
    .toast-warning { background: var(--color-warning); }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @media (max-width: 768px) {
      .toast-container {
        left: var(--space-md);
        right: var(--space-md);
        bottom: var(--space-md);
      }
      .toast { max-width: 100%; }
    }
  `],
})
export class ToastContainerComponent {
  protected readonly toastService: ToastService;
  protected readonly iconMap: Record<string, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  constructor(toastService: ToastService) {
    this.toastService = toastService;
  }
}
