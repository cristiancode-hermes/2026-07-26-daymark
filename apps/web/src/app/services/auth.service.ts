import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service';
import { User } from '../interfaces';

interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'daymark_token';
  private readonly api: ApiService;
  private readonly router: Router;

  readonly user = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.user() !== null);

  constructor(api: ApiService, router: Router) {
    this.api = api;
    this.router = router;
    this.loadUser();
  }

  login(email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.api.post<AuthResponse>('/auth/login', { email, password }).subscribe({
        next: (res) => {
          this.setSession(res);
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  register(name: string, email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.api.post<AuthResponse>('/auth/register', { name, email, password }).subscribe({
        next: (res) => {
          this.setSession(res);
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.accessToken);
    this.user.set(res.user);
  }

  private loadUser(): void {
    const token = this.getToken();
    if (!token) return;

    this.api.get<User>('/auth/me').subscribe({
      next: (user) => this.user.set(user),
      error: () => {
        localStorage.removeItem(this.tokenKey);
        this.router.navigate(['/login']);
      },
    });
  }
}
