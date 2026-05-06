import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DashboardStore } from '../../store/dashboard.store';
import { icons } from '../../shared/icons';
import { SettingsDialog } from './settings-dialog/settings-dialog';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    TranslateModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FontAwesomeModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  router = inject(Router);
  store = inject(DashboardStore);
  toast = inject(ToastService);
  translate = inject(TranslateService);
  settingsDialog = inject(MatDialog);

  icons = icons;

  resultsPerPageOptions = this.store.resultsPerPageOptions;

  user = this.store.user;

  constructor() {
    this.store.loadDashboard();
  }

  settings() {
    const dialogRef = this.settingsDialog.open(SettingsDialog, {
      disableClose: true,
      data: { user: this.user(), resultsPerPageOptions: this.resultsPerPageOptions },
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.store
          .updateUser(data.firstName, data.lastName, data.language, data.defaultResultsPerPage)
          .subscribe(() => {
            localStorage.setItem('language', data.language);
            this.translate.use(data.language);
            this.toast.success(this.translate.instant('DASHBOARD.SETTINGS_SAVED'));
          });
      }
    });
  }

  logout() {
    this.store.clear();
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);
  }
}
