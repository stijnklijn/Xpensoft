import { Component, Inject, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { finalize } from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DashboardStore } from '../../../../store/dashboard.store';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-delete-transaction-dialog',
  imports: [TranslateModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './delete-transaction-dialog.html',
})
export class DeleteTransactionDialog {
  dialogRef = inject(MatDialogRef<DeleteTransactionDialog>);
  store = inject(DashboardStore);
  toast = inject(ToastService);
  translate = inject(TranslateService);

  loading = signal(false);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  confirm() {
    this.loading.set(true);

    this.store
      .deleteTransaction(this.data.id)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe(() => {
        this.toast.success(this.translate.instant('TRANSACTIONS.TRANSACTION_DELETED'));
        this.dialogRef.close();
      });
  }
}
