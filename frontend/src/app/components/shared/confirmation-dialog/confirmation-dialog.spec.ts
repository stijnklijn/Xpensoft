import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Observable, of } from 'rxjs';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { ConfirmationDialog, ConfirmationDialogData } from './confirmation-dialog';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('ConfirmationDialog', () => {
  let fixture: ComponentFixture<ConfirmationDialog>;
  let component: ConfirmationDialog;

  let dialogRefMock: Pick<MatDialogRef<ConfirmationDialog>, 'close'>;

  const dialogData: ConfirmationDialogData = {
    title: 'Delete category',
    message: 'Are you sure you want to delete ZEmpty?',
  };

  beforeEach(async () => {
    dialogRefMock = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        ConfirmationDialog,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeTranslateLoader,
          },
        }),
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialog);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render dialog title', () => {
    const title = fixture.nativeElement.querySelector('h3');
    expect(title.textContent.trim()).toBe('Delete category');
  });

  it('should render dialog message', () => {
    const message = fixture.nativeElement.querySelector('.message');
    expect(message.textContent.trim()).toBe('Are you sure you want to delete ZEmpty?');
  });

  it('should close dialog with true when confirm button clicked', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.controls button');
    const confirmButton = buttons[0];
    confirmButton.click();
    expect(dialogRefMock.close).toHaveBeenCalledOnce();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false when cancel button clicked', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.controls button');
    const cancelButton = buttons[1];
    cancelButton.click();
    expect(dialogRefMock.close).toHaveBeenCalledOnce();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with false when close button clicked', () => {
    const closeButton = fixture.nativeElement.querySelector('button.close');
    closeButton.click();
    expect(dialogRefMock.close).toHaveBeenCalledOnce();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });
});
