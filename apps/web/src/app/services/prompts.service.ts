import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Prompt } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class PromptsService {
  constructor(private readonly api: ApiService) {}

  getToday(): Observable<Prompt> {
    return this.api.get<Prompt>('/prompts/today');
  }

  getRandom(): Observable<Prompt> {
    return this.api.get<Prompt>('/prompts/random');
  }
}
