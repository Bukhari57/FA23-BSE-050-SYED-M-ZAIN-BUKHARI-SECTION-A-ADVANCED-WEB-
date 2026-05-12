import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: '<div class="skeleton" [style.height.px]="height()"></div>',
  styleUrl: './skeleton-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonCardComponent {
  readonly height = input<number>(110);
}
