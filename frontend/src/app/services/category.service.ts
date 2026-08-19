import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Auth } from './auth';

export interface Category {
  _id?: string;
  name: string;
  type: 'income' | 'expense';
  description?: string;
  isDefault?: boolean;
}

export interface CategoryListResponse {
  count: number;
  categories: Category[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly API_URL =
    'http://localhost:5000/api/categories';

  constructor(
    private http: HttpClient,
    private authService: Auth
  ) {}

  private getHeaders(): HttpHeaders {

    const token =
      this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

  }

  getCategories(): Observable<CategoryListResponse> {

    return this.http.get<CategoryListResponse>(
      this.API_URL,
      {
        headers: this.getHeaders()
      }
    );

  }

  addCategory(category: Category) {

    return this.http.post(
      this.API_URL,
      category,
      {
        headers: this.getHeaders()
      }
    );

  }

  updateCategory(
    id: string,
    category: Category
  ) {

    return this.http.put(
      `${this.API_URL}/${id}`,
      category,
      {
        headers: this.getHeaders()
      }
    );

  }

  deleteCategory(id: string) {

    return this.http.delete(
      `${this.API_URL}/${id}`,
      {
        headers: this.getHeaders()
      }
    );

  }

}