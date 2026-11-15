import { Component, computed, input } from '@angular/core';

export type SkeletonShape = 'text' | 'rect' | 'circle';

/** Placeholder shown while content loads. Purely visual, so hidden from assistive technology. */
@Component({
  selector: 'app-skeleton',
  template: '',
  styleUrl: './skeleton.css',
  host: {
    'aria-hidden': 'true',
    '[class]': "'skeleton skeleton--' + shape()",
    '[style.width]': 'width()',
    '[style.height]': 'resolvedHeight()',
  },
})
export class Skeleton {
  shape = input<SkeletonShape>('text');
  width = input('100%');
  height = input<string>();

  resolvedHeight = computed(() => {
    if (this.shape() === 'circle') {
      return this.width();
    }
    return this.height() ?? (this.shape() === 'text' ? '1em' : '48px');
  });
}
