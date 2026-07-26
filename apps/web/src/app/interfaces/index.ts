export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Entry {
  id: string;
  date: string;
  content: string;
  mood: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  entryCount?: number;
}

export interface Prompt {
  id: string;
  text: string;
  category: string;
}

export interface Goal {
  weeklyTarget: number;
  streakTarget: number;
}

export interface StreakStats {
  current: number;
  longest: number;
}

export interface InsightsSummary {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  mostFrequentMood: string;
  bestDay: string;
}

export interface CalendarDay {
  day: number;
  mood: string;
  hasEntry: boolean;
}
