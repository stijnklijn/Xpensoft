import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-edit-category-dialog',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './add-edit-category-dialog.html',
})
export class AddEditCategoryDialog implements OnInit {
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
}
