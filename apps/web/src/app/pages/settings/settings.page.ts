import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';
import { EntriesService, PaginatedResponse } from '../../services/entries.service';
import { CardComponent } from '../../shared/card.component';
import { ButtonComponent } from '../../shared/button.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  template: `
    <div class="settings-page">
      <header class="page-header">
        <h1>Configuración</h1>
      </header>

      <!-- Profile info -->
      <app-card>
        <h3 class="card-title">Perfil</h3>
        <div class="profile-info">
          <div class="profile-avatar">{{ authService.user()?.name?.charAt(0)?.toUpperCase() || '?' }}</div>
          <div class="profile-details">
            <span class="profile-name">{{ authService.user()?.name }}</span>
            <span class="profile-email">{{ authService.user()?.email }}</span>
          </div>
        </div>
      </app-card>

      <!-- Appearance -->
      <app-card>
        <h3 class="card-title">Apariencia</h3>
        <div class="setting-row">
          <div>
            <span class="setting-label">Modo oscuro</span>
            <span class="setting-desc">Cambiar entre tema claro y oscuro</span>
          </div>
          <label class="toggle">
            <input type="checkbox" [checked]="themeService.isDark()" (change)="themeService.toggle()" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </app-card>

      <!-- Export -->
      <app-card>
        <h3 class="card-title">Exportar datos</h3>
        <div class="export-actions">
          <app-button variant="secondary" (onClick)="exportJson()">Exportar como JSON</app-button>
          <app-button variant="secondary" (onClick)="exportText()">Exportar como texto</app-button>
        </div>
      </app-card>

      <!-- Danger zone -->
      <app-card>
        <h3 class="card-title danger-title">Zona de peligro</h3>
        <p class="danger-desc">Esta acción cerrará tu sesión en el dispositivo.</p>
        <app-button variant="danger" (onClick)="authService.logout()">Cerrar sesión</app-button>
      </app-card>
    </div>
  `,
  styles: [`
    .settings-page { display: flex; flex-direction: column; gap: var(--space-md); max-width: 600px; }
    .page-header h1 { font-size: var(--text-h1); font-weight: 700; color: var(--color-ink); }
    .card-title { font-size: var(--text-h3); font-weight: 600; color: var(--color-ink); margin-bottom: var(--space-md); }
    .profile-info { display: flex; align-items: center; gap: var(--space-md); }
    .profile-avatar { width: 48px; height: 48px; border-radius: var(--radius-full); background: var(--color-accent-muted); color: var(--color-accent); display: flex; align-items: center; justify-content: center; font-size: var(--text-h1); font-weight: 700; }
    .profile-details { display: flex; flex-direction: column; gap: 2px; }
    .profile-name { font-size: var(--text-body); font-weight: 600; color: var(--color-ink); }
    .profile-email { font-size: var(--text-body-sm); color: var(--color-ink-secondary); }
    .setting-row { display: flex; justify-content: space-between; align-items: center; }
    .setting-label { display: block; font-size: var(--text-body); font-weight: 500; color: var(--color-ink); margin-bottom: 2px; }
    .setting-desc { font-size: var(--text-body-sm); color: var(--color-ink-secondary); }
    .toggle { position: relative; display: inline-block; width: 48px; height: 26px; cursor: pointer; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .toggle-slider { position: absolute; inset: 0; background: var(--color-border); border-radius: var(--radius-full); transition: background 200ms; }
    .toggle-slider::before { content: ''; position: absolute; left: 3px; bottom: 3px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: transform 200ms; }
    .toggle input:checked + .toggle-slider { background: var(--color-accent); }
    .toggle input:checked + .toggle-slider::before { transform: translateX(22px); }
    .export-actions { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
    .danger-title { color: var(--color-danger); }
    .danger-desc { font-size: var(--text-body-sm); color: var(--color-ink-secondary); margin-bottom: var(--space-md); }
  `],
})
export class SettingsPageComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  private readonly toast = inject(ToastService);
  private readonly entriesService = inject(EntriesService);
  private readonly destroyRef = inject(DestroyRef);

  private allEntries: any[] = [];

  ngOnInit(): void {
    // Load all entries for export
    this.entriesService.list({ limit: 1000 }).pipe(
      catchError(() => of({ data: [] })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (res) => {
        this.allEntries = (res as any).data ?? [];
      },
    });
  }

  protected exportJson(): void {
    const data = {
      exportedAt: new Date().toISOString(),
      user: this.authService.user(),
      entries: this.allEntries,
    };
    this.downloadFile(JSON.stringify(data, null, 2), 'daymark-export.json', 'application/json');
    this.toast.success('Exportación JSON completada');
  }

  protected exportText(): void {
    const text = this.allEntries
      .map((e: any) => {
        const tags = (e.tags ?? []).map((t: any) => t.name).join(', ');
        return `=== ${e.date} ===\nÁnimo: ${e.mood}\n${tags ? 'Etiquetas: ' + tags + '\n' : ''}${e.content}\n`;
      })
      .join('\n---\n\n');

    this.downloadFile(text, 'daymark-export.txt', 'text/plain');
    this.toast.success('Exportación de texto completada');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
