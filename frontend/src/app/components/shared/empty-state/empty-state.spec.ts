import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyState } from './empty-state';

@Component({
  imports: [EmptyState],
  template: `
    <app-empty-state icon="category" heading="No categories" [description]="description">
      <button data-testid="action">Add category</button>
    </app-empty-state>
  `,
})
class Host {
  description?: string = 'Add a category first.';
}

describe('EmptyState', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();

    fixture = TestBed.createComponent(Host);
  });

  it('should render the heading, description and projected action', () => {
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[data-testid="empty-state-heading"]')?.textContent).toBe(
      'No categories',
    );
    expect(element.querySelector('[data-testid="empty-state-description"]')?.textContent).toBe(
      'Add a category first.',
    );
    expect(element.querySelector('[data-testid="action"]')).not.toBeNull();
  });

  it('should omit the description when none is given', () => {
    fixture.componentInstance.description = undefined;
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-testid="empty-state-description"]'),
    ).toBeNull();
  });
});
