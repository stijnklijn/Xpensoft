import { Component, Input } from '@angular/core';

import { ChartConfiguration, ChartDataset } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-doughnut-chart',
  imports: [BaseChartDirective],
  templateUrl: './doughnut-chart.html',
})
export class DoughnutChart {
  @Input() labels: Array<string> = [];
  @Input() datasets: ChartDataset<'doughnut', (number | [number, number] | null)[]>[] = [];

  options: ChartConfiguration<'doughnut'>['options'] = {
    aspectRatio: 2,
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: function (context) {
            let value = context.parsed;
            return value!.toLocaleString('nl-NL', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          },
        },
      },
    },
  };
}
