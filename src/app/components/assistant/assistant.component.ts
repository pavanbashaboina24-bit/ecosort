import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WasteService } from '../../services/waste.service';
import { GeminiService } from '../../services/gemini.service';
import { WasteItemResult, ScanHistoryItem } from '../../models/ecosort.models';

const PRESETS = ['banana peel', 'plastic bottle', 'battery', 'newspaper', 'glass bottle'];

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant.component.html',
  styleUrls: ['./assistant.component.scss']
})
export class AssistantComponent implements OnInit {
  inputText = '';
  isAnalyzing = signal(false);
  result = signal<WasteItemResult | null>(null);
  recentScans = signal<ScanHistoryItem[]>([]);
  presets = PRESETS;

  constructor(private wasteService: WasteService, private gemini: GeminiService) {}

  /** Surfaces the real reason the AI call failed (e.g. invalid API key) instead
   *  of silently showing local-database results with no explanation. */
  get aiError(): string | null {
    return this.gemini.lastError();
  }

  ngOnInit() {
    this.refreshHistory();
  }

  private async refreshHistory() {
    this.recentScans.set(await this.wasteService.getRecentHistory());
  }

  async classify(item?: string) {
    const query = (item ?? this.inputText).trim();
    if (!query) return;
    this.inputText = query;
    this.isAnalyzing.set(true);
    this.result.set(null);

    try {
      const data = await this.wasteService.classify(query);
      this.result.set(data);
    } finally {
      this.isAnalyzing.set(false);
      await this.refreshHistory();
    }
  }

  categoryClass(category: string): string {
    if (category?.includes('Wet'))        return 'badge-wet';
    if (category?.includes('Recyclable')) return 'badge-recycle';
    if (category?.includes('Dry'))        return 'badge-dry';
    return 'badge-hazardous';
  }

  binDotClass(binColor: string): string {
    const c = binColor?.toLowerCase() ?? '';
    if (c.includes('green')) return 'dot-green';
    if (c.includes('blue'))  return 'dot-blue';
    if (c.includes('grey'))  return 'dot-grey';
    return 'dot-red';
  }

  historyBadgeClass(category: string): string {
    if (category?.includes('Wet'))        return 'hbadge-wet';
    if (category?.includes('Recyclable')) return 'hbadge-recycle';
    if (category?.includes('Hazardous'))  return 'hbadge-hazardous';
    return 'hbadge-dry';
  }

  historyIconClass(binColor: string): string {
    const c = binColor?.toLowerCase() ?? '';
    if (c.includes('green')) return 'hicon-green';
    if (c.includes('blue'))  return 'hicon-blue';
    if (c.includes('red'))   return 'hicon-red';
    return 'hicon-grey';
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)   return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    return `${Math.floor(diff / 3600)} hours ago`;
  }
}
