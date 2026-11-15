import { Component, input } from '@angular/core';

/** The Xpensoft mark. Takes its colour from `color` (primary by default). */
@Component({
  selector: 'app-logo',
  templateUrl: './logo.html',
  styleUrl: './logo.css',
  host: {
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
})
export class Logo {
  size = input(32);
  /** Accessible name; when omitted the logo is treated as decorative. */
  label = input<string>();
}
