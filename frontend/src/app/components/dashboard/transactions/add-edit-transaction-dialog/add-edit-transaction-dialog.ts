import { Component, Inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-edit-transaction-dialog',
  templateUrl: './add-edit-transaction-dialog.html',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
  ],
})
export class AddEditTransactionDialog implements OnInit {
  isIncome = signal(false);

  formBuilder = new FormBuilder();
  form = this.formBuilder.group({
    date: [null, Validators.required],
    description: [null, [Validators.required, this.lengthValid]],
    category: [null, Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01), Validators.max(999_999.99)]],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    if (this.data?.transaction) {
      const category = this.data.categories.find(
        (c: any) => c.id === this.data.transaction.categoryId,
      );
      this.form.patchValue({
        ...this.data.transaction,
        category,
        amount: parseFloat(this.data.transaction.amount).toFixed(2),
      });
      this.isIncome.set(category.isIncome);
    }

    this.form.get('category')?.valueChanges.subscribe((c: any) => {
      this.isIncome.set(c.isIncome);
    });
  }

  onDateInput(event: MatDatepickerInputEvent<Date>) {
    const regex = /^\d{1,2}-\d{1,2}-\d{4}$/;
    const input = event.targetElement as HTMLInputElement;
    const value = input?.value;

    if (input && !regex.test(value)) {
      this.form.controls.date.setErrors({ invalidFormat: true });
    }
  }

  lengthValid(control: AbstractControl): ValidationErrors | null {
    if (control.value == null || control.value.trim().length < 2) {
      return { lengthInvalid: true };
    }

    return null;
  }
}
