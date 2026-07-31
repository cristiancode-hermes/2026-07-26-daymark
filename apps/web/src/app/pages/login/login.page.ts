import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ButtonComponent } from '../../shared/button.component';
import { CardComponent } from '../../shared/card.component';
import { SpinnerComponent } from '../../shared/spinner.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, FormsModule, ButtonComponent, CardComponent, SpinnerComponent],
  template: `
    <div class="auth-page">
      <app-card>
        <div class="auth-header">
          <h1>✦ Daymark</h1>
          <p class="auth-subtitle">Tu diario personal de reflexión</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="tu@correo.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
          </div>

          @if (error()) {
            <p class="auth-error">{{ error() }}</p>
          }

          <app-button type="submit" [disabled]="loading()" variant="primary" size="lg">
            @if (loading()) {
              <app-spinner [size]="20" />
              Iniciando sesión…
            } @else {
              Iniciar sesión
            }
          </app-button>
        </form>

        <p class="auth-footer">
          ¿No tienes cuenta?
          <a routerLink="/register">Regístrate</a>
        </p>
      </app-card>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      padding: var(--space-md);
    }
    :host-context(app-root) app-card {
      max-width: 420px;
      width: 100%;
      box-shadow: var(--shadow-3);
    }
    .auth-header {
      text-align: center;
      margin-bottom: var(--space-xl);
    }
    .auth-header h1 {
      font-family: var(--font-display);
      font-size: var(--text-display);
      font-weight: 600;
      color: var(--color-accent);
      margin-bottom: var(--space-xs);
      letter-spacing: -0.02em;
    }
    .auth-subtitle {
      font-size: var(--text-body-sm);
      color: var(--color-ink-secondary);
      font-style: italic;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: var(--text-label);
      font-weight: 600;
      color: var(--color-ink);
    }
    .form-group input {
      font-family: var(--font-primary);
      font-size: var(--text-body);
      padding: 11px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-ink);
      outline: none;
      transition: border-color 150ms, box-shadow 150ms;
    }
    .form-group input:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px var(--color-accent-soft);
    }
    .auth-error {
      font-size: var(--text-body-sm);
      color: var(--color-danger);
      text-align: center;
    }
    .auth-footer {
      text-align: center;
      margin-top: var(--space-md);
      font-size: var(--text-body-sm);
      color: var(--color-ink-secondary);
    }
  `],
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected loading = signal(false);
  protected error = signal('');

  protected async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.error.set('Completa todos los campos');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.email, this.password);
      this.toast.success('Sesión iniciada correctamente');
      this.router.navigate(['/dashboard']);
    } catch {
      this.error.set('Credenciales inválidas. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
}
