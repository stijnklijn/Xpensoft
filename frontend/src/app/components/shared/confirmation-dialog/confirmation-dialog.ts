import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';

export interface ConfirmationDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  imports: [TranslateModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirmation-dialog.html',
})
export class ConfirmationDialog {
  data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
}
