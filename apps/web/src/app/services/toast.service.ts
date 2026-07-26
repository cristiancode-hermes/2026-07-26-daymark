import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

let nextId = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private readonly duration = 3500;

  success(text: string): void {
    this.add('success', text);
  }

  error(text: string): void {
    this.add('error', text);
  }

  info(text: string): void {
    this.add('info', text);
  }

  warning(text: string): void {
    this.add('warning', text);
  }

  dismiss(id: number): void {
    this.messages.update(msgs => msgs.filter(m => m.id !== id));
  }

  private add(type: ToastMessage['type'], text: string): void {
    const id = ++nextId;
    this.messages.update(msgs => [...msgs, { id, type, text }]);
    setTimeout(() => this.dismiss(id), this.duration);
  }
}
