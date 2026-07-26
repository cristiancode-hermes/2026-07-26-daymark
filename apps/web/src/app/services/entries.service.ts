import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Entry } from '../interfaces';

export interface EntryListParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  tagId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class EntriesService {
  constructor(private readonly api: ApiService) {}

  list(params?: EntryListParams): Observable<PaginatedResponse<Entry>> {
    return this.api.get<PaginatedResponse<Entry>>('/entries', params as Record<string, string | number | boolean | undefined>);
  }

  getById(id: string): Observable<Entry> {
    return this.api.get<Entry>(`/entries/${id}`);
  }

  getToday(): Observable<Entry | null> {
    return this.api.get<Entry | null>('/entries/today');
  }

  create(data: { content: string; mood: string; tagIds?: string[] }): Observable<Entry> {
    return this.api.post<Entry>('/entries', data);
  }

  update(id: string, data: { content: string; mood: string; tagIds?: string[] }): Observable<Entry> {
    return this.api.put<Entry>(`/entries/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/entries/${id}`);
  }

  getByDate(date: string): Observable<Entry | null> {
    return this.api.get<Entry | null>(`/entries/date/${date}`);
  }

  getCalendarMonth(year: number, month: number): Observable<Record<string, string>> {
    return this.api.get<Record<string, string>>(`/entries/calendar/${year}/${month}`);
  }
}
