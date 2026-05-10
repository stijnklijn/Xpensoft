import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AddEditTransactionDialog } from './add-edit-transaction-dialog/add-edit-transaction-dialog';
import { DashboardStore } from '../../../store/dashboard.store';
import { DeleteTransactionDialog } from './delete-transaction-dialog/delete-transaction-dialog';
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
  deleteTransactionDialog = inject(MatDialog);

  icons = icons;

  resultsPerPageOptions = this.store.resultsPerPageOptions;
  sortOptions = signal<Array<SortOption>>([]);

  transactions = this.store.transactions;
  categories = this.store.categories;
  currentPageNumber = this.store.currentPageNumber;
  resultsPerPage = this.store.resultsPerPage;
  sort = this.store.sort;
  filter = this.store.filter;

  constructor() {
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
  }

  filteredTransactions = computed(() =>
    this.transactions().filter((t) =>
      t.description.toUpperCase().includes(this.filter().toUpperCase()),
    ),
  );

  currentPageData = computed(() => {
    const start = (this.currentPageNumber() - 1) * this.resultsPerPage();
    const end = start + this.resultsPerPage();

    return this.filteredTransactions()
      .sort((a: Transaction, b: Transaction) => {
        if (this.sort().asc) {
          return a[this.sort().field] < b[this.sort().field] ? -1 : 1;
        } else {
          return a[this.sort().field] < b[this.sort().field] ? 1 : -1;
        }
      })
      .slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredTransactions().length / this.resultsPerPage());
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
    this.addEditTransactionDialog.open(AddEditTransactionDialog, {
      disableClose: true,
      data: {
        isNew: true,
        categories: this.categories()?.sort((a, b) =>
          a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1,
        ),
      },
    });
  }

  editTransaction(transaction: Transaction) {
    this.addEditTransactionDialog.open(AddEditTransactionDialog, {
      disableClose: true,
      data: {
        isNew: false,
        categories: this.categories()?.sort((a, b) =>
          a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1,
        ),
        transaction,
      },
    });
  }

  deleteTransaction(transaction: Transaction) {
    this.deleteTransactionDialog.open(DeleteTransactionDialog, {
      disableClose: true,
      data: transaction,
    });
  }
}
