import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Explains why a view is empty; project a call-to-action button as content. */
@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  /** Material Symbols icon name. */
  icon = input.required<string>();
  heading = input.required<string>();
  description = input<string>();
}
