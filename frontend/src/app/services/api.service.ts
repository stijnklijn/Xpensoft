import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  http = inject(HttpClient);

  userExists(email: string): Observable<any> {
    return this.http.post(`${environment.API_URL}/users/exists`, { email });
  }

  createUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Observable<any> {
    return this.http.post(`${environment.API_URL}/users`, {
      firstName,
      lastName,
      email,
      password,
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(
      `${environment.API_URL}/login`,
      {
        email,
        password,
      },
      { headers: { 'x-skip-error-interceptor': 'true' } },
    );
  }

  getUser(): Observable<any> {
    return this.http.get(`${environment.API_URL}/users`);
  }

  updateUser(
    firstName: string,
    lastName: string,
    language: string,
    defaultResultsPerPage: number,
  ): Observable<any> {
    return this.http.put(`${environment.API_URL}/users`, {
      firstName,
      lastName,
      language,
      defaultResultsPerPage,
    });
  }

  createTransaction(
    date: string,
    description: string,
    categoryId: string,
    amount: number,
  ): Observable<any> {
    return this.http.post(`${environment.API_URL}/transactions`, {
      date,
      description,
      categoryId,
      amount,
    });
  }

  getTransactions(): Observable<any> {
    return this.http.get(`${environment.API_URL}/transactions`);
  }

  updateTransaction(
    id: string,
    date: string,
    description: string,
    categoryId: string,
    amount: number,
  ): Observable<any> {
    return this.http.put(`${environment.API_URL}/transactions/${id}`, {
      date,
      description,
      categoryId,
      amount,
    });
  }

  deleteTransaction(id: string): Observable<any> {
    return this.http.delete(`${environment.API_URL}/transactions/${id}`);
  }

  createCategory(name: string, isIncome: boolean): Observable<any> {
    return this.http.post(`${environment.API_URL}/categories`, { name, isIncome });
  }

  getCategories(): Observable<any> {
    return this.http.get(`${environment.API_URL}/categories`);
  }

  updateCategory(id: string, name: string, isIncome: boolean): Observable<any> {
    return this.http.put(`${environment.API_URL}/categories/${id}`, { name, isIncome });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${environment.API_URL}/categories/${id}`);
  }
}
