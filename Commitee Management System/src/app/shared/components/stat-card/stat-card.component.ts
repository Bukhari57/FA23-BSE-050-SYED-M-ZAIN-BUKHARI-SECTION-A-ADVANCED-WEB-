import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass, DecimalPipe, MatIconModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<number>();
  readonly icon = input<string>('insights');
  readonly trend = input<number | null>(null);
  readonly trendLabel = input<string>('vs last month');
}
