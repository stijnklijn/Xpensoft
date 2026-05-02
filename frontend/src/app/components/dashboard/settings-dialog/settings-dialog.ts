import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

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
  ],
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.css',
})
export class SettingsDialog implements OnInit {
  translate = inject(TranslateService);

  browserLang = this.translate.getBrowserLang();
  localStorageLang = localStorage.getItem('language');

  supportedLanguages = [
    { code: 'en', label: 'English', flag: 'gb' },
    { code: 'nl', label: 'Nederlands', flag: 'nl' },
  ];

  tab = signal<'personal' | 'preferences'>('personal');

  formBuilder = new FormBuilder();

  form = this.formBuilder.group({
    firstName: [null, [Validators.required, this.lengthValid]],
    lastName: [null, [Validators.required, this.lengthValid]],
    language: [this.localStorageLang ?? this.browserLang ?? 'en'],
    defaultResultsPerPage: [null],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

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
}
