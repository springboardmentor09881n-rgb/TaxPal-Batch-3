import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

export interface ChatResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = 'http://localhost:5000/api/chat';

  constructor(
    private http: HttpClient,
    private authService: Auth
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  sendMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      this.API_URL, 
      { message },
      { headers: this.getHeaders() }
    );
  }
}
