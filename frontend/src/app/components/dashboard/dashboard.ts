import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule,
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

  loading = this.store.loading;
  user = this.store.user;

  constructor() {
    this.store.loadDashboard();
  }

  settings() {
    this.settingsDialog.open(SettingsDialog, {
      disableClose: true,
      data: { user: this.user(), resultsPerPageOptions: this.resultsPerPageOptions },
    });
  }

  logout() {
    this.store.clear();
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);
  }
}
