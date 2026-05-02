import { Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AddEditCategoryDialog } from './add-edit-category-dialog/add-edit-category-dialog';
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
  store = inject(DashboardStore);
  translate = inject(TranslateService);
  toast = inject(ToastService);
  addEditCategoryDialog = inject(MatDialog);

  icons = icons;

  transactions = this.store.transactions;
  categories = this.store.categories;

  constructor() {
    this.store.loadDashboard();
  }

  sortedCategories = computed(() =>
    [...this.categories()].sort((a, b) => (a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1)),
  );

  addCategory() {
    const dialogRef = this.addEditCategoryDialog.open(AddEditCategoryDialog, {
      disableClose: true,
      data: {
        isNew: true,
        categories: this.categories(),
      },
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.store.createCategory(data.name, data.isIncome).subscribe(() => {
          this.toast.success(this.translate.instant('CATEGORIES.CATEGORY_SAVED'));
        });
      }
    });
  }

  editCategory(category: Category) {
    const dialogRef = this.addEditCategoryDialog.open(AddEditCategoryDialog, {
      disableClose: true,
      data: {
        isNew: false,
        categories: this.categories(),
        category,
      },
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.store.updateCategory(category.id, data.name, data.isIncome).subscribe(() => {
          this.toast.success(this.translate.instant('CATEGORIES.CATEGORY_SAVED'));
        });
      }
    });
  }

  deleteCategory(id: string) {
    this.store.deleteCategory(id).subscribe(() => {
      this.toast.success(this.translate.instant('CATEGORIES.CATEGORY_DELETED'));
    });
  }
}
