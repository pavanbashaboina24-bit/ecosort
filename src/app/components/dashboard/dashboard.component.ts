import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteService } from '../../services/waste.service';
import { ImpactStats, CategoryBreakdown } from '../../models/ecosort.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = signal<ImpactStats>({ itemsSegregated: 0, co2Saved: 0, landfillDiverted: 0, accuracyRate: 0 });
  breakdown = signal<CategoryBreakdown>({ wet: 0, dry: 0, recyclable: 0, hazardous: 0, total: 0 });
  loading = signal(true);

  // SVG pie-slice geometry, recomputed from real data (circumference = 2 * PI * r = 251.2 for r=40)
  private readonly CIRCUMFERENCE = 251.2;

  constructor(private wasteService: WasteService) {}

  async ngOnInit() {
    this.loading.set(true);
    const [stats, breakdown] = await Promise.all([
      this.wasteService.getStats(),
      this.wasteService.getBreakdown()
    ]);
    this.stats.set(stats);
    this.breakdown.set(breakdown);
    this.loading.set(false);
  }

  /** Percentage of total scans in each category, real data — used for both legend and pie geometry. */
  pct(count: number): number {
    const total = this.breakdown().total;
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  /** stroke-dasharray offset for a pie slice, given the cumulative percentage consumed so far. */
  dashOffset(cumulativePct: number): number {
    return this.CIRCUMFERENCE * (1 - cumulativePct / 100);
  }

  get wetCumPct()        { return this.pct(this.breakdown().wet); }
  get recyclableCumPct() { return this.wetCumPct + this.pct(this.breakdown().recyclable); }
  get dryCumPct()        { return this.recyclableCumPct + this.pct(this.breakdown().dry); }
}
