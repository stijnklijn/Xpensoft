import { Injectable, inject, signal } from '@angular/core';

import { forkJoin, switchMap, tap } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  api = inject(ApiService);
  translate = inject(TranslateService);

  resultsPerPageOptions = [
    10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
  ];

  user = signal<User | null>(null);
  transactions = signal<Transaction[]>([]);
  categories = signal<Category[]>([]);
  currentPageNumber = signal<number>(1);
  resultsPerPage = signal<number>(100);
  sort = signal<SortOption>({ field: 'date', asc: false });
  filter = signal<string>('');

  loaded = false;

  loadDashboard() {
    if (this.loaded) return;

    forkJoin({
      user: this.api.getUser(),
      transactions: this.api.getTransactions(),
      categories: this.api.getCategories(),
    }).subscribe(({ user, transactions, categories }) => {
      this.user.set(user);

      if (user.language) {
        localStorage.setItem('language', user.language);
        this.translate.use(user.language);
      }

      if (user.defaultResultsPerPage) {
        this.resultsPerPage.set(user.defaultResultsPerPage);
      }

      this.transactions.set(transactions.data);
      this.categories.set(categories.data);
      this.loaded = true;
    });
  }

  updateUser(firstName: string, lastName: string, language: string, defaultResultsPerPage: number) {
    return this.api.updateUser(firstName, lastName, language, defaultResultsPerPage).pipe(
      switchMap(() => this.api.getUser()),
      tap((user) => {
        this.user.set(user);
      }),
    );
  }

  createTransaction(date: string, description: string, categoryId: string, amount: number) {
    return this.api.createTransaction(date, description, categoryId, amount).pipe(
      switchMap(() => this.api.getTransactions()),
      tap(({ data }) => {
        this.transactions.set(data);
      }),
    );
  }

  updateTransaction(
    id: string,
    date: string,
    description: string,
    categoryId: string,
    amount: number,
  ) {
    return this.api.updateTransaction(id, date, description, categoryId, amount).pipe(
      switchMap(() => this.api.getTransactions()),
      tap(({ data }) => {
        this.transactions.set(data);
      }),
    );
  }

  deleteTransaction(id: string) {
    return this.api.deleteTransaction(id).pipe(
      switchMap(() => this.api.getTransactions()),
      tap(({ data }) => {
        this.transactions.set(data);
      }),
    );
  }

  createCategory(name: string, isIncome: boolean) {
    return this.api.createCategory(name, isIncome).pipe(
      switchMap(() => this.api.getCategories()),
      tap(({ data }) => {
        this.categories.set(data);
      }),
    );
  }

  updateCategory(id: string, name: string, isIncome: boolean) {
    return this.api.updateCategory(id, name, isIncome).pipe(
      switchMap(() => this.api.getCategories()),
      tap(({ data }) => {
        this.categories.set(data);
      }),
    );
  }

  deleteCategory(id: string) {
    return this.api.deleteCategory(id).pipe(
      switchMap(() => this.api.getCategories()),
      tap(({ data }) => {
        this.categories.set(data);
      }),
    );
  }

  clear() {
    this.user.set(null);
    this.transactions.set([]);
    this.categories.set([]);
    this.currentPageNumber.set(1);
    this.resultsPerPage.set(100);
    this.sort.set({ field: 'date', asc: false });
    this.filter.set('');
    this.loaded = false;
  }
}
