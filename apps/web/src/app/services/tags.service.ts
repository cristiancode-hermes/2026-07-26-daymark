import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Tag } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class TagsService {
  constructor(private readonly api: ApiService) {}

  list(): Observable<Tag[]> {
    return this.api.get<Tag[]>('/tags');
  }

  create(data: { name: string; color: string }): Observable<Tag> {
    return this.api.post<Tag>('/tags', data);
  }

  update(id: string, data: { name: string; color: string }): Observable<Tag> {
    return this.api.put<Tag>(`/tags/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/tags/${id}`);
  }
}
