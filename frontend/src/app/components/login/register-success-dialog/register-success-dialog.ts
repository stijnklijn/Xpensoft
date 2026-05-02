import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register-success-dialog',
  imports: [TranslateModule, MatDialogModule, MatButtonModule],
  templateUrl: './register-success-dialog.html',
})
export class RegisterSuccessDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
