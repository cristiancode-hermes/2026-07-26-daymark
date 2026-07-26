# Daymark API Reference

Base URL: `/api`

## Authentication

### Register
```
POST /api/auth/register
Body: { email: string, name: string, password: string }
Response: { token: string, user: User }
```

### Login
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: User }
```

### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user: User }
```

## Entries

### List Entries (Paginated)
```
GET /api/entries?page=1&limit=10&tagId=xxx&from=2026-07-01&to=2026-07-26
Response: { entries: Entry[], total: number, page: number }
```

### Get Today's Entry
```
GET /api/entries/today
Response: { entry: Entry | null }
```

### Create Entry
```
POST /api/entries
Body: { date: string, content: string, mood: string, tagIds: string[] }
Response: { entry: Entry }
```

### Get Entry
```
GET /api/entries/:id
Response: { entry: Entry }
```

### Update Entry
```
PATCH /api/entries/:id
Body: { content?: string, mood?: string, tagIds?: string[] }
Response: { entry: Entry }
```

### Delete Entry
```
DELETE /api/entries/:id
Response: { deleted: true }
```

## Tags

### List Tags
```
GET /api/tags
Response: { tags: Tag[] }
```

### Create Tag
```
POST /api/tags
Body: { name: string, color?: string }
Response: { tag: Tag }
```

### Update Tag
```
PATCH /api/tags/:id
Body: { name?: string, color?: string }
Response: { tag: Tag }
```

### Delete Tag
```
DELETE /api/tags/:id
Response: { deleted: true }
```

## Prompts

### Today's Prompt
```
GET /api/prompts/today
Response: { prompt: Prompt }
```

### Random Prompt
```
GET /api/prompts/random?excludeId=xxx
Response: { prompt: Prompt }
```

### All Prompts
```
GET /api/prompts
Response: { prompts: Prompt[] }
```

## Insights

### Mood Distribution
```
GET /api/insights/mood-distribution?from=30days&to=today
Response: { distribution: { mood: string, count: number }[] }
```

### Weekly Trend
```
GET /api/insights/weekly-trend?weeks=4
Response: { trends: { week: string, avgMood: number, count: number }[] }
```

### Summary
```
GET /api/insights/summary
Response: { summary: InsightsSummary }
```

## Goals

### Get Goals
```
GET /api/goals
Response: { goals: Goal }
```

### Set Goals
```
PUT /api/goals
Body: { weeklyTarget: number, streakTarget: number }
Response: { goals: Goal }
```

### Get Progress
```
GET /api/goals/progress
Response: { weeklyProgress: number, streakProgress: number }
```

## Stats

### Streak
```
GET /api/stats/streak
Response: { current: number, longest: number }
```

### Calendar
```
GET /api/stats/calendar?year=2026&month=7
Response: { year: number, month: number, days: CalendarDay[] }
```

## Entities

```typescript
interface User { id: string; email: string; name: string; }
interface Entry { id: string; date: string; content: string; mood: string; tags: Tag[]; createdAt: string; updatedAt: string; }
interface Tag { id: string; name: string; color: string; entryCount?: number; }
interface Prompt { id: string; text: string; category: string; }
interface Goal { weeklyTarget: number; streakTarget: number; }
interface CalendarDay { day: number; mood: string; hasEntry: boolean; }
```