import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPageComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'entries/new',
    loadComponent: () => import('./pages/entry-editor/entry-editor.page').then(m => m.EntryEditorPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'entries/:id',
    loadComponent: () => import('./pages/entry-detail/entry-detail.page').then(m => m.EntryDetailPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'entries/:id/edit',
    loadComponent: () => import('./pages/entry-editor/entry-editor.page').then(m => m.EntryEditorPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'entries',
    loadComponent: () => import('./pages/entry-history/entry-history.page').then(m => m.EntryHistoryPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'calendar',
    loadComponent: () => import('./pages/calendar/calendar.page').then(m => m.CalendarPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'insights',
    loadComponent: () => import('./pages/insights/insights.page').then(m => m.InsightsPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tags',
    loadComponent: () => import('./pages/tags/tags.page').then(m => m.TagsPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'goals',
    loadComponent: () => import('./pages/goals/goals.page').then(m => m.GoalsPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPageComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '/dashboard' },
];
