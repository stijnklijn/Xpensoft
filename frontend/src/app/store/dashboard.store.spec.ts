import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { describe, beforeEach, afterEach, expect, it, vi, Mocked } from 'vitest';

import { TranslateService } from '@ngx-translate/core';

import { CategoryService } from '../api/generated/category';
import { TransactionService } from '../api/generated/transaction';
import { UserService } from '../api/generated/user';

import {
  CategoryDto,
  PageResultOfCategoryDto,
  PageResultOfTransactionDto,
  TransactionDto,
  UserResponseDto,
  UserUpdateRequestDto,
} from '../api/generated/models';

import { DashboardStore } from './dashboard.store';

describe('DashboardStore', () => {
  let store: DashboardStore;
  let userServiceMock: Partial<Mocked<UserService>>;
  let transactionServiceMock: Partial<Mocked<TransactionService>>;
  let categoryServiceMock: Partial<Mocked<CategoryService>>;
  let translateServiceMock: Partial<Mocked<TranslateService>>;

  beforeEach(() => {
    userServiceMock = {
      getUsers: vi.fn().mockReturnValue(
        of({
          firstName: 'Stijn',
          lastName: 'Klijn',
          language: 'en',
          defaultResultsPerPage: 50,
        } as UserResponseDto),
      ),
      putUsers: vi.fn().mockReturnValue(of(undefined)),
    };

    transactionServiceMock = {
      getTransactions: vi.fn().mockReturnValue(
        of({
          data: [
            {
              id: '1',
              date: '2026-01-01',
              description: 'Strawberries',
              categoryId: '1',
              amount: 3,
            },
          ],
        } as PageResultOfTransactionDto),
      ),
      postTransactions: vi.fn().mockReturnValue(of(undefined)),
      putTransactionsEntityId: vi.fn().mockReturnValue(of(undefined)),
      deleteTransactionsEntityId: vi.fn().mockReturnValue(of(undefined)),
    };

    categoryServiceMock = {
      getCategories: vi.fn().mockReturnValue(
        of({
          data: [
            {
              id: '1',
              name: 'Groceries',
              isIncome: false,
            },
          ],
        } as PageResultOfCategoryDto),
      ),
      postCategories: vi.fn().mockReturnValue(of(undefined)),
      putCategoriesEntityId: vi.fn().mockReturnValue(of(undefined)),
      deleteCategoriesEntityId: vi.fn().mockReturnValue(of(undefined)),
    };

    translateServiceMock = {
      use: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceMock,
        },
        {
          provide: CategoryService,
          useValue: categoryServiceMock,
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    });

    store = TestBed.inject(DashboardStore);

    vi.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadDashboard', () => {
    it('should load dashboard data', () => {
      store.loadDashboard();

      expect(userServiceMock.getUsers).toHaveBeenCalledOnce();
      expect(transactionServiceMock.getTransactions).toHaveBeenCalledOnce();
      expect(categoryServiceMock.getCategories).toHaveBeenCalledOnce();
      expect(store.user()).toEqual({
        firstName: 'Stijn',
        lastName: 'Klijn',
        language: 'en',
        defaultResultsPerPage: 50,
      });
      expect(store.transactions()).toHaveLength(1);
      expect(store.categories()).toHaveLength(1);
      expect(store.resultsPerPage()).toBe(50);
      expect(store.loaded).toBe(true);
      expect(store.loading()).toBe(false);
    });

    it('should set preferred language', () => {
      store.loadDashboard();

      expect(localStorage.setItem).toHaveBeenCalledWith('language', 'en');
      expect(translateServiceMock.use).toHaveBeenCalledWith('en');
    });

    it('should not reload when already loaded', () => {
      store.loaded = true;

      store.loadDashboard();

      expect(userServiceMock.getUsers).not.toHaveBeenCalled();
      expect(transactionServiceMock.getTransactions).not.toHaveBeenCalled();
      expect(categoryServiceMock.getCategories).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update the user', () => {
      const dto: UserUpdateRequestDto = {
        firstName: 'Stijn',
        lastName: 'Klijn',
        language: 'nl',
        defaultResultsPerPage: 10,
      };

      store.updateUser(dto).subscribe();

      expect(userServiceMock.putUsers).toHaveBeenCalledWith(dto);
      expect(userServiceMock.getUsers).toHaveBeenCalled();
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction', () => {
      const dto = {
        date: '2026-01-02',
        description: 'Bananas',
        categoryId: '1',
        amount: 2,
      } as TransactionDto;

      store.createTransaction(dto).subscribe();

      expect(transactionServiceMock.postTransactions).toHaveBeenCalledWith(dto);
      expect(transactionServiceMock.getTransactions).toHaveBeenCalled();
      expect(store.transactions()).toHaveLength(1);
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction', () => {
      const dto = {
        date: '2026-01-03',
        description: 'Peaches',
        categoryId: '1',
        amount: 2.5,
      } as TransactionDto;

      store.updateTransaction('1', dto).subscribe();

      expect(transactionServiceMock.putTransactionsEntityId).toHaveBeenCalledWith('1', dto);
      expect(transactionServiceMock.getTransactions).toHaveBeenCalled();
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', () => {
      store.deleteTransaction('1').subscribe();

      expect(transactionServiceMock.deleteTransactionsEntityId).toHaveBeenCalledWith('1');
      expect(transactionServiceMock.getTransactions).toHaveBeenCalled();
    });
  });

  describe('createCategory', () => {
    it('should create a category', () => {
      const dto = {
        name: 'Groceries',
        isIncome: false,
      } as CategoryDto;

      store.createCategory(dto).subscribe();

      expect(categoryServiceMock.postCategories).toHaveBeenCalledWith(dto);
      expect(categoryServiceMock.getCategories).toHaveBeenCalled();
      expect(store.categories()).toHaveLength(1);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', () => {
      const dto = {
        name: 'Salary',
        isIncome: true,
      } as CategoryDto;

      store.updateCategory('1', dto).subscribe();

      expect(categoryServiceMock.putCategoriesEntityId).toHaveBeenCalledWith('1', dto);
      expect(categoryServiceMock.getCategories).toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', () => {
      store.deleteCategory('1').subscribe();

      expect(categoryServiceMock.deleteCategoriesEntityId).toHaveBeenCalledWith('1');
      expect(categoryServiceMock.getCategories).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear the store', () => {
      store.loadDashboard();

      store.clear();

      expect(store.user()).toBeNull();
      expect(store.transactions()).toEqual([]);
      expect(store.categories()).toEqual([]);
      expect(store.currentPageNumber()).toBe(1);
      expect(store.resultsPerPage()).toBe(100);
      expect(store.sort()).toEqual({
        field: 'date',
        asc: false,
      });
      expect(store.filter()).toBe('');
      expect(store.loaded).toBe(false);
    });
  });
});
