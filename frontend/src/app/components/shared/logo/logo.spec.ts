import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Logo } from './logo';

describe('Logo', () => {
  let fixture: ComponentFixture<Logo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Logo] }).compileComponents();

    fixture = TestBed.createComponent(Logo);
  });

  it('should be decorative when no label is given', () => {
    fixture.detectChanges();

    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.hasAttribute('role')).toBe(false);
  });

  it('should expose the label as accessible name', () => {
    fixture.componentRef.setInput('label', 'Xpensoft');
    fixture.detectChanges();

    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Xpensoft');
    expect(svg.hasAttribute('aria-hidden')).toBe(false);
  });

  it('should apply the size to the host element', () => {
    fixture.componentRef.setInput('size', 48);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.width).toBe('48px');
    expect(host.style.height).toBe('48px');
  });
});
