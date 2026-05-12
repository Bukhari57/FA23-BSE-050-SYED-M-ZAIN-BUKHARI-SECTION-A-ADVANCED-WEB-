import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule, StatCardComponent, SkeletonCardComponent, EmptyStateComponent, CurrencyPipe, DatePipe],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);

  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  protected readonly loading = signal(true);
  protected readonly stats = signal({
    totalCommittees: 0,
    activeMembers: 0,
    monthlyCollections: 0,
    upcomingPayouts: 0,
  });
  protected readonly recentTransactions = signal<Array<{ _id: string; description?: string; type: string; amount: number; processedAt: string }>>([]);
  protected readonly notifications = signal<Array<{ _id: string; title: string; body: string; type: string; createdAt: string }>>([]);
  private chart: Chart | null = null;

  ngOnInit(): void {
    this.fetchDashboard();
  }

  ngAfterViewInit(): void {
    this.renderChart([], []);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private fetchDashboard(): void {
    this.loading.set(true);

    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.stats.set(data.stats);
        this.recentTransactions.set(data.recentTransactions as never);
        this.notifications.set(data.notifications as never);

        const labels = data.chart.map((entry) => `${entry._id.month}/${String(entry._id.year).slice(-2)}`);
        const values = data.chart.map((entry) => entry.collected);
        this.renderChart(labels, values);

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private renderChart(labels: string[], values: number[]): void {
    if (!this.chartCanvas) {
      return;
    }

    this.chart?.destroy();
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: values,
            label: 'Collections',
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14,165,233,0.15)',
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
      },
    });
  }
}
