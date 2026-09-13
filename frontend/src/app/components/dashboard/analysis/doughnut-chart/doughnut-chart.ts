import { Component, Input, LOCALE_ID, inject } from '@angular/core';

import { ChartConfiguration, ChartDataset } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-doughnut-chart',
  imports: [BaseChartDirective],
  templateUrl: './doughnut-chart.html',
})
export class DoughnutChart {
  private locale = inject(LOCALE_ID);

  @Input() labels: Array<string> = [];
  @Input() datasets: ChartDataset<'doughnut', (number | [number, number] | null)[]>[] = [];

  options: ChartConfiguration<'doughnut'>['options'] = {
    aspectRatio: 2,
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: (context) => {
            let value = context.parsed;
            return value!.toLocaleString(this.locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          },
        },
      },
    },
  };
}
