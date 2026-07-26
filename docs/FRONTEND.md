# Daymark — Frontend Documentation

## Setup

Angular 22 standalone application with zoneless change detection and signal-based state management.

## Key Patterns

### Signal Triad
Every page uses three independent signals for state management:
```typescript
protected readonly items = signal<T[]>([]);
protected readonly loading = signal(true);
protected readonly error = signal('');
```

Template priority: loading → error → empty → content

### Lazy Loading
All page components are lazy-loaded via `loadComponent`:
```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPageComponent),
}
```

### Auth
- JWT stored in localStorage under `daymark_token`
- `authInterceptor` injects Bearer token into all `/api/` requests
- `authGuard` redirects to `/login` when unauthenticated

### Theme
- CSS variables define full light/dark palette in `styles.css`
- `ThemeService` toggles `data-theme` attribute on `<html>` element
- Preference persisted in localStorage under `daymark_theme`

### API Communication
- `ApiService` wraps HttpClient with `/api` base prefix
- Each domain has its own service (entries, tags, prompts, insights, goals)
- All services return Observables consumed by page components

### Toast Notifications
- `ToastService` provides success/error/info feedback
- `ToastContainerComponent` placed in root AppComponent
- Auto-dismiss after 3 seconds

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | LoginPageComponent | Email + password login |
| `/register` | RegisterPageComponent | Registration form |
| `/dashboard` | DashboardPageComponent | Today's entry, stats, streak |
| `/entries/new` | EntryEditorPageComponent | New journal entry |
| `/entries/:id` | EntryDetailPageComponent | View entry |
| `/entries/:id/edit` | EntryEditorPageComponent | Edit entry |
| `/entries` | EntryHistoryPageComponent | Browse all entries |
| `/calendar` | CalendarPageComponent | Monthly calendar view |
| `/insights` | InsightsPageComponent | Mood trends & stats |
| `/tags` | TagsPageComponent | Tag management |
| `/goals` | GoalsPageComponent | Writing goals |
| `/settings` | SettingsPageComponent | Account, theme, export |

## Shared Components

| Component | Purpose |
|-----------|---------|
| ButtonComponent | Primary/secondary/ghost button variants |
| CardComponent | Content projection card container |
| ModalComponent | Overlay modal with close |
| SpinnerComponent | Loading spinner |
| SkeletonComponent | Content skeleton loader |
| EmptyStateComponent | Empty state with CTA |
| ToastComponent | Toast notification display |
| FormFieldComponent | Input with label and error state |
| MoodSelectorComponent | 5-point mood emoji selector |
| StreakBadgeComponent | Fire emoji + streak count |
| TagPillComponent | Colored tag with optional remove |
| CalendarDayComponent | Calendar day cell with mood dot |

## Design System

Notion-inspired warm journal palette. Full tokens in `styles.css`:

- Background: warm off-white / dark charcoal
- Accent: warm amber (#c97b4b)
- Mood colors: 5 distinct hues per mood level
- Typography: Inter font family
- Shadows: 4 elevation levels
- Radius: 4px-12px scale
