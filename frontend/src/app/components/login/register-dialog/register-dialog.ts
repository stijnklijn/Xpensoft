import { Component, inject, Inject, signal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';

import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../api/generated/user';

@Component({
  selector: 'app-register-dialog',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register-dialog.html',
})
export class RegisterDialog {
  userService = inject(UserService);

  loading = signal(false);
  registeredEmail = signal('');

  formBuilder = new FormBuilder();
  form = this.formBuilder.group(
    {
      firstName: [null, [Validators.required, this.lengthValid]],
      lastName: [null, [Validators.required, this.lengthValid]],
      email: this.formBuilder.control(null, {
        validators: [Validators.required, Validators.email],
        asyncValidators: [this.emailAvailable(this.userService)],
        updateOn: 'blur',
      }),
      password: [
        null,
        [
          Validators.required,
          Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$'),
        ],
      ],
      repeatPassword: [null, Validators.required],
    },
    { validators: this.passwordsEqual },
  );

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  lengthValid(control: AbstractControl): ValidationErrors | null {
    if (control.value == null || control.value.trim().length < 2) {
      return { lengthInvalid: true };
    }

    return null;
  }

  emailAvailable(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);

      return of(control.value).pipe(
        switchMap((email) => userService.postUsersExists({ email })),
        map((reponse) => (reponse.exists ? { emailExists: true } : null)),
        catchError(() => of(null)),
      );
    };
  }

  passwordsEqual(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const repeatPassword = group.get('repeatPassword')?.value;
    if (!password || !repeatPassword) return null;
    return password === repeatPassword ? null : { passwordsNotEqual: true };
  }

  register() {
    this.form.disable();
    this.loading.set(true);

    const values = this.form.getRawValue();

    this.userService
      .postUsers({
        firstName: values.firstName!,
        lastName: values.lastName!,
        email: values.email!,
        password: values.password!,
      })
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.form.enable();
        }),
      )
      .subscribe(() => this.registeredEmail.set(values.email!));
  }
}
