import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private http = inject(HttpClient);
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);

  constructor() {}

  sendMessage(userText: string) {
    if (!userText.trim()) return;

    // 1. Update UI immediately
    this.updateMessages('user', userText);
    this.isLoading.set(true);

    const url = `${environment.BASE_URL}/api/Public/ask`;
    const body = { message: userText };

    this.http.post<any>(url, body).subscribe({
      next: (res) => {
        const text = res.response || 'عفواً، لم أستطع فهم الرد.';
        this.updateMessages('model', text);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('API Error:', err);
        const errorMessage = 'عفواً، حدث خطأ في الاتصال.';
        this.updateMessages('model', errorMessage);
        this.isLoading.set(false);
      },
    });
  }

  private updateMessages(role: 'user' | 'model', text: string) {
    this.messages.update((msgs) => [
      ...msgs,
      { role, text, timestamp: new Date() },
    ]);
  }
}
