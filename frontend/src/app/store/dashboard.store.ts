import { Injectable, inject, signal } from '@angular/core';

import { finalize, forkJoin, switchMap, tap } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

import { CategoryDto, TransactionDto, UserUpdateRequestDto } from '../api/generated/models';
import { CategoryService } from '../api/generated/category';
import { TransactionService } from '../api/generated/transaction';
import { UserService } from '../api/generated/user';

import { toCategoryEntities } from '../mappers/category.mapper';
import { toTransactionEntities } from '../mappers/transaction.mapper';
import { toUserEntity } from '../mappers/user.mapper';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  userService = inject(UserService);
  categoryService = inject(CategoryService);
  transactionService = inject(TransactionService);
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

  loading = signal(false);
  loaded = false;

  loadDashboard() {
    if (this.loaded) return;

    this.loading.set(true);

    forkJoin({
      userResponseDto: this.userService.getUsers(),
      pageResultOfTransactionDto: this.transactionService.getTransactions(),
      pageResultOfCategoryDto: this.categoryService.getCategories(),
    })
      .pipe(
        tap(({ userResponseDto, pageResultOfTransactionDto, pageResultOfCategoryDto }) => {
          this.user.set(toUserEntity(userResponseDto));

          if (userResponseDto.language) {
            localStorage.setItem('language', userResponseDto.language);
            this.translate.use(userResponseDto.language);
          }

          if (userResponseDto.defaultResultsPerPage) {
            this.resultsPerPage.set(Number(userResponseDto.defaultResultsPerPage));
          }

          this.transactions.set(toTransactionEntities(pageResultOfTransactionDto.data));
          this.categories.set(toCategoryEntities(pageResultOfCategoryDto.data));
          this.loaded = true;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  updateUser(dto: UserUpdateRequestDto) {
    return this.userService.putUsers(dto).pipe(
      switchMap(() => this.userService.getUsers()),
      tap((userDto) => {
        this.user.set(toUserEntity(userDto));
      }),
    );
  }

  createTransaction(dto: TransactionDto) {
    return this.transactionService.postTransactions(dto).pipe(
      switchMap(() => this.transactionService.getTransactions()),
      tap((pageResultOfTransactionDto) => {
        this.transactions.set(toTransactionEntities(pageResultOfTransactionDto.data));
      }),
    );
  }

  updateTransaction(id: string, dto: TransactionDto) {
    return this.transactionService.putTransactionsEntityId(id, dto).pipe(
      switchMap(() => this.transactionService.getTransactions()),
      tap((pageResultOfTransactionDto) => {
        this.transactions.set(toTransactionEntities(pageResultOfTransactionDto.data));
      }),
    );
  }

  deleteTransaction(id: string) {
    return this.transactionService.deleteTransactionsEntityId(id).pipe(
      switchMap(() => this.transactionService.getTransactions()),
      tap((pageResultOfTransactionDto) => {
        this.transactions.set(toTransactionEntities(pageResultOfTransactionDto.data));
      }),
    );
  }

  createCategory(dto: CategoryDto) {
    return this.categoryService.postCategories(dto).pipe(
      switchMap(() => this.categoryService.getCategories()),
      tap((pageResultOfCategoryDto) => {
        this.categories.set(toCategoryEntities(pageResultOfCategoryDto.data));
      }),
    );
  }

  updateCategory(id: string, dto: CategoryDto) {
    return this.categoryService.putCategoriesEntityId(id, dto).pipe(
      switchMap(() => this.categoryService.getCategories()),
      tap((pageResultOfCategoryDto) => {
        this.categories.set(toCategoryEntities(pageResultOfCategoryDto.data));
      }),
    );
  }

  deleteCategory(id: string) {
    return this.categoryService.deleteCategoriesEntityId(id).pipe(
      switchMap(() => this.categoryService.getCategories()),
      tap((pageResultOfCategoryDto) => {
        this.categories.set(toCategoryEntities(pageResultOfCategoryDto.data));
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
