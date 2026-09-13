import { Component, Input, LOCALE_ID, OnInit, inject } from '@angular/core';

import { ChartConfiguration, ChartDataset } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-bar-chart',
  imports: [BaseChartDirective],
  templateUrl: './bar-chart.html',
})
export class BarChart implements OnInit {
  private locale = inject(LOCALE_ID);

  @Input() labels: Array<string> = [];
  @Input() datasets: ChartDataset<'bar', (number | [number, number] | null)[]>[] = [];
  @Input() displayLegend: boolean = false;

  options: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          font: { size: 16 },
        },
      },
      y: {
        ticks: {
          font: { size: 16 },
        },
      },
    },
    plugins: {
      legend: {
        labels: { font: { size: 16 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let value = context.parsed.y;
            return value!.toLocaleString(this.locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          },
        },
      },
    },
  };

  ngOnInit(): void {
    this.options!.plugins!.legend!.display = this.displayLegend;
  }
}
