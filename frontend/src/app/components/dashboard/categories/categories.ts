import { Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { filter } from 'rxjs';

import { AddEditCategoryDialog } from './add-edit-category-dialog/add-edit-category-dialog';
import { ConfirmationDialog } from '../../shared/confirmation-dialog/confirmation-dialog';
import { DashboardStore } from '../../../store/dashboard.store';
import { icons } from '../../../shared/icons';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-categories',
  imports: [TranslateModule, FontAwesomeModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  dialog = inject(MatDialog);
  store = inject(DashboardStore);
  toast = inject(ToastService);
  translate = inject(TranslateService);

  icons = icons;

  transactions = this.store.transactions;
  categories = this.store.categories;

  sortedCategories = computed(() =>
    [...this.categories()].sort((a, b) => (a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1)),
  );

  addCategory() {
    this.dialog.open(AddEditCategoryDialog, {
      disableClose: true,
      data: {
        isNew: true,
        categories: this.categories(),
      },
    });
  }

  editCategory(category: Category) {
    this.dialog.open(AddEditCategoryDialog, {
      disableClose: true,
      data: {
        isNew: false,
        categories: this.categories(),
        category,
      },
    });
  }

  deleteCategory(category: Category) {
    this.dialog
      .open(ConfirmationDialog, {
        disableClose: true,
        data: {
          title: this.translate.instant('CATEGORIES.DIALOG.HEADER.DELETE'),
          message: `${this.translate.instant('CATEGORIES.DIALOG.CONFIRM_DELETE')} ${category.name}?`,
        },
      })
      .afterClosed()
      .pipe(filter((confirmed) => confirmed))
      .subscribe(() => {
        this.store.deleteCategory(category.id).subscribe(() => {
          this.toast.success(this.translate.instant('CATEGORIES.CATEGORY_DELETED'));
        });
      });
  }

  calcNumTransactions(id: string) {
    return this.transactions().filter((t) => t.categoryId === id).length;
  }
}
