import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AddEditTransactionDialog } from './add-edit-transaction-dialog/add-edit-transaction-dialog';
import { DashboardStore } from '../../../store/dashboard.store';
import { icons } from '../../../shared/icons';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-transactions',
  imports: [TranslateModule, FormsModule, DatePipe, DecimalPipe, FontAwesomeModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  store = inject(DashboardStore);
  translate = inject(TranslateService);
  toast = inject(ToastService);
  addEditTransactionDialog = inject(MatDialog);

  icons = icons;

  resultsPerPageOptions = this.store.resultsPerPageOptions;
  sortOptions = signal<Array<SortOption>>([]);

  transactions = this.store.transactions;
  categories = this.store.categories;
  currentPageNumber = this.store.currentPageNumber;
  resultsPerPage = this.store.resultsPerPage;
  sort = this.store.sort;
  filter = this.store.filter;

  currentPageData = signal<Array<Transaction>>([]);
  filteredTransactionsAmount = signal<number>(0);

  constructor() {
    effect(() => {
      const transactions = this.transactions();
      const currentPageNumber = this.currentPageNumber();
      const resultsPerPage = this.resultsPerPage();
      const sort = this.sort();

      const start = (currentPageNumber - 1) * resultsPerPage;
      const end = start + resultsPerPage;

      const filteredTransactions = transactions.filter((t) =>
        t.description.toUpperCase().includes(this.filter().toUpperCase()),
      );

      this.filteredTransactionsAmount.set(filteredTransactions.length);

      this.currentPageData.set(
        filteredTransactions
          .sort((a: Transaction, b: Transaction) => {
            if (sort.asc) {
              return a[sort.field] < b[sort.field] ? -1 : 1;
            } else {
              return a[sort.field] < b[sort.field] ? 1 : -1;
            }
          })
          .slice(start, end),
      );
    });

    this.translate
      .stream([
        'TRANSACTIONS.SORT_OPTIONS.DATE_ASC',
        'TRANSACTIONS.SORT_OPTIONS.DATE_DESC',
        'TRANSACTIONS.SORT_OPTIONS.DESCRIPTION_ASC',
        'TRANSACTIONS.SORT_OPTIONS.DESCRIPTION_DESC',
        'TRANSACTIONS.SORT_OPTIONS.AMOUNT_ASC',
        'TRANSACTIONS.SORT_OPTIONS.AMOUNT_DESC',
      ])
      .subscribe((t) => {
        this.sortOptions.set([
          { label: t['TRANSACTIONS.SORT_OPTIONS.DATE_ASC'], field: 'date', asc: true },
          { label: t['TRANSACTIONS.SORT_OPTIONS.DATE_DESC'], field: 'date', asc: false },
          {
            label: t['TRANSACTIONS.SORT_OPTIONS.DESCRIPTION_ASC'],
            field: 'description',
            asc: true,
          },
          {
            label: t['TRANSACTIONS.SORT_OPTIONS.DESCRIPTION_DESC'],
            field: 'description',
            asc: false,
          },
          { label: t['TRANSACTIONS.SORT_OPTIONS.AMOUNT_ASC'], field: 'amount', asc: true },
          { label: t['TRANSACTIONS.SORT_OPTIONS.AMOUNT_DESC'], field: 'amount', asc: false },
        ]);
      });

    this.store.loadDashboard();
  }

  totalPages = computed(() => {
    return Math.ceil(this.filteredTransactionsAmount() / this.resultsPerPage());
  });

  selectedSortIndex = computed(() =>
    this.sortOptions().findIndex((o) => o.field === this.sort().field && o.asc === this.sort().asc),
  );

  categoryMap = computed(() => {
    const categories = this.categories();
    if (!categories) return {};
    return Object.fromEntries(categories.map((c) => [c.id, c]));
  });

  changeResultsPerPage(resultsPerPage: number) {
    this.resultsPerPage.set(resultsPerPage);
    this.currentPageNumber.set(1);
  }

  changePageNumber(page: number) {
    this.currentPageNumber.set(page);
  }

  changeSortByIndex(index: string) {
    const i = Number(index);
    this.sort.set(this.sortOptions()[i]);
  }

  setFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    const normalized = input.value.replace(/\s+/g, ' ').trimStart();
    this.filter.set(normalized);
    this.currentPageNumber.set(1);
  }

  removeFilter() {
    this.filter.set('');
    this.currentPageNumber.set(1);
  }

  addTransaction() {
    const dialogRef = this.addEditTransactionDialog.open(AddEditTransactionDialog, {
      disableClose: true,
      data: {
        isNew: true,
        categories: this.categories()?.sort((a, b) =>
          a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1,
        ),
      },
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        const date = this.toISOString(new Date(data.date));
        this.store
          .createTransaction(date, data.description, data.category.id, data.amount)
          .subscribe(() => {
            this.toast.success(this.translate.instant('TRANSACTIONS.TRANSACTION_SAVED'));
          });
      }
    });
  }

  editTransaction(transaction: Transaction) {
    const dialogRef = this.addEditTransactionDialog.open(AddEditTransactionDialog, {
      disableClose: true,
      data: {
        isNew: false,
        categories: this.categories()?.sort((a, b) =>
          a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1,
        ),
        transaction,
      },
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        const date = this.toISOString(new Date(data.date));
        this.store
          .updateTransaction(transaction.id, date, data.description, data.category.id, data.amount)
          .subscribe(() => {
            this.toast.success(this.translate.instant('TRANSACTIONS.TRANSACTION_SAVED'));
          });
      }
    });
  }

  deleteTransaction(id: string) {
    this.store.deleteTransaction(id).subscribe(() => {
      this.toast.success(this.translate.instant('TRANSACTIONS.TRANSACTION_DELETED'));
    });
  }

  toISOString(date: Date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
}
