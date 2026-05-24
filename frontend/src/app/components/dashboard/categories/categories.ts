import { Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AddEditCategoryDialog } from './add-edit-category-dialog/add-edit-category-dialog';
import { DashboardStore } from '../../../store/dashboard.store';
import { DeleteCategoryDialog } from './delete-category-dialog/delete-category-dialog';
import { icons } from '../../../shared/icons';

@Component({
  selector: 'app-categories',
  imports: [TranslateModule, FontAwesomeModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  store = inject(DashboardStore);
  translate = inject(TranslateService);
  addEditCategoryDialog = inject(MatDialog);
  deleteCategoryDialog = inject(MatDialog);

  icons = icons;

  transactions = this.store.transactions;
  categories = this.store.categories;

  sortedCategories = computed(() =>
    [...this.categories()].sort((a, b) => (a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1)),
  );

  addCategory() {
    this.addEditCategoryDialog.open(AddEditCategoryDialog, {
      disableClose: true,
      data: {
        isNew: true,
        categories: this.categories(),
      },
    });
  }

  editCategory(category: Category) {
    this.addEditCategoryDialog.open(AddEditCategoryDialog, {
      disableClose: true,
      data: {
        isNew: false,
        categories: this.categories(),
        category,
      },
    });
  }

  deleteCategory(category: Category) {
    this.deleteCategoryDialog.open(DeleteCategoryDialog, {
      disableClose: true,
      data: category,
    });
  }

  calcNumTransactions(id: string) {
    return this.transactions().filter((t) => t.categoryId === id).length;
  }
}
