import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { finalize } from 'rxjs';

import { DashboardStore } from '../../../../store/dashboard.store';
import { ToastService } from '../../../../services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-edit-category-dialog',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-edit-category-dialog.html',
})
export class AddEditCategoryDialog implements OnInit {
  dialogRef = inject(MatDialogRef<AddEditCategoryDialog>);
  store = inject(DashboardStore);
  toast = inject(ToastService);
  translate = inject(TranslateService);

  loading = signal(false);

  formBuilder = new FormBuilder();
  form = this.formBuilder.group({
    name: [null, [Validators.required, this.lengthValid, this.nameUnique.bind(this)]],
    isIncome: [null, Validators.required],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    if (this.data?.category) {
      this.form.patchValue(this.data.category);
    }
  }

  lengthValid(control: AbstractControl): ValidationErrors | null {
    if (control.value == null || control.value.trim().length < 2) {
      return { lengthInvalid: true };
    }

    return null;
  }

  nameUnique(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.data?.categories) return null;

    const id = this.data?.category?.id;
    const value = control.value.trim().toUpperCase();

    return this.data.categories.some((c: any) => c.id !== id && c.name.toUpperCase() === value)
      ? { nameNotUnique: true }
      : null;
  }

  save() {
    this.form.disable();
    this.loading.set(true);

    const values = this.form.getRawValue();

    const request = this.data.isNew
      ? this.store.createCategory({ name: values.name!, isIncome: values.isIncome! })
      : this.store.updateCategory(this.data.category.id, {
          name: values.name!,
          isIncome: values.isIncome!,
        });

    request
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.form.enable();
        }),
      )
      .subscribe(() => {
        this.toast.success(this.translate.instant('CATEGORIES.CATEGORY_SAVED'));
        this.dialogRef.close();
      });
  }
}
