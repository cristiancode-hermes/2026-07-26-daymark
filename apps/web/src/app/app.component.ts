import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { ToastContainerComponent } from './shared/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  template: `
    @if (authService.isAuthenticated()) {
      <header class="app-header">
        <div class="header-left">
          <a routerLink="/dashboard" class="logo">✦ Daymark</a>
          <nav class="nav-links">
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Inicio</a>
            <a routerLink="/entries" routerLinkActive="active">Entradas</a>
            <a routerLink="/calendar" routerLinkActive="active">Calendario</a>
            <a routerLink="/insights" routerLinkActive="active">Insights</a>
          </nav>
        </div>
        <div class="header-right">
          <button class="btn-icon" (click)="themeService.toggle()" [attr.aria-label]="themeService.isDark() ? 'Modo claro' : 'Modo oscuro'">
            {{ themeService.isDark() ? '☀️' : '🌙' }}
          </button>
          <div class="user-menu">
            <span class="user-name">{{ authService.user()?.name }}</span>
            <a routerLink="/settings" class="btn-icon">⚙️</a>
            <button class="btn-ghost btn-sm" (click)="authService.logout()">Salir</button>
          </div>
        </div>
      </header>
    }
    <main class="main-content">
      <router-outlet />
    </main>
    <app-toast-container />
  `,
  styles: [`
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 28px;
      border-bottom: 1px solid var(--color-border-light);
      background: color-mix(in srgb, var(--color-bg) 92%, transparent);
      backdrop-filter: blur(8px);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .logo {
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--color-accent);
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    .nav-links {
      display: flex;
      gap: 4px;
    }
    .nav-links a {
      padding: 7px 14px;
      border-radius: var(--radius-full);
      color: var(--color-ink-secondary);
      font-size: var(--text-body-sm);
      font-weight: 500;
      text-decoration: none;
      transition: color 150ms, background 150ms;
    }
    .nav-links a:hover {
      color: var(--color-ink);
      background: var(--color-surface-hover);
    }
    .nav-links a.active {
      color: var(--color-accent);
      background: var(--color-accent-soft);
      font-weight: 600;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 6px;
      border-radius: var(--radius-sm);
      color: var(--color-ink-secondary);
      transition: color 150ms, background 150ms;
    }
    .btn-icon:hover {
      color: var(--color-ink);
      background: var(--color-surface-hover);
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-name {
      font-size: var(--text-body-sm);
      color: var(--color-ink-secondary);
    }
    .btn-sm {
      padding: 4px 10px;
      font-size: var(--text-body-sm);
    }
    .btn-ghost {
      background: transparent;
      border: none;
      color: var(--color-ink-secondary);
      cursor: pointer;
      border-radius: var(--radius-sm);
      font-weight: 500;
    }
    .btn-ghost:hover {
      color: var(--color-danger);
      background: var(--color-surface-hover);
    }
    .main-content {
      max-width: 960px;
      margin: 0 auto;
      padding: var(--space-lg);
    }
    @media (max-width: 768px) {
      .app-header {
        padding: 10px 16px;
        flex-wrap: wrap;
        gap: 8px;
      }
      .header-left { gap: 16px; }
      .nav-links { gap: 4px; }
      .nav-links a { padding: 4px 8px; font-size: var(--text-caption); }
      .user-name { display: none; }
      .main-content { padding: var(--space-md); }
    }
  `]
})
export class AppComponent {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
}
