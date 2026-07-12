import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { finalize } from 'rxjs';

import { DashboardStore } from '../../../store/dashboard.store';
import { ToastService } from '../../../services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-settings-dialog',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.css',
})
export class SettingsDialog implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<SettingsDialog>);
  store = inject(DashboardStore);
  toast = inject(ToastService);
  translate = inject(TranslateService);

  browserLang = this.translate.getBrowserLang();
  localStorageLang = localStorage.getItem('language');

  supportedLanguages = [
    { code: 'en', label: 'English', flag: 'gb' },
    { code: 'nl', label: 'Nederlands', flag: 'nl' },
  ];

  tab = signal<'personal' | 'preferences'>('personal');
  loading = signal(false);

  formBuilder = new FormBuilder();
  form = this.formBuilder.group({
    firstName: this.formBuilder.control<string | null>(null, [
      Validators.required,
      this.lengthValid,
    ]),
    lastName: this.formBuilder.control<string | null>(null, [
      Validators.required,
      this.lengthValid,
    ]),
    language: this.formBuilder.control<string | null>(
      this.localStorageLang ?? this.browserLang ?? 'en',
    ),
    defaultResultsPerPage: this.formBuilder.control<number | null>(null),
  });

  ngOnInit() {
    this.form.setValue({
      firstName: this.data.user.firstName,
      lastName: this.data.user.lastName,
      language: this.data.user.language ?? this.localStorageLang ?? this.browserLang ?? 'en',
      defaultResultsPerPage: this.data.user.defaultResultsPerPage ?? 100,
    });
  }

  changeTab(tab: 'personal' | 'preferences') {
    this.tab.set(tab);
  }

  lengthValid(control: AbstractControl): ValidationErrors | null {
    if (control.value == null || control.value.trim().length < 2) {
      return { lengthInvalid: true };
    }

    return null;
  }

  save() {
    this.form.disable();
    this.loading.set(true);

    const values = this.form.getRawValue();

    this.store
      .updateUser({
        firstName: values.firstName!,
        lastName: values.lastName!,
        language: values.language!,
        defaultResultsPerPage: values.defaultResultsPerPage!,
      })
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.form.enable();
        }),
      )
      .subscribe(() => {
        localStorage.setItem('language', values.language!);
        this.translate.use(values.language!);
        this.toast.success(this.translate.instant('DASHBOARD.SETTINGS_SAVED'));
        this.dialogRef.close();
      });
  }
}
