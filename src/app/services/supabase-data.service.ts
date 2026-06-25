import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { WasteItemResult, ScanHistoryItem, ImpactStats, GameScorePayload, CategoryBreakdown } from '../models/ecosort.models';

const DEFAULT_STATS: ImpactStats = { itemsSegregated: 0, co2Saved: 0, landfillDiverted: 0, accuracyRate: 0 };

/**
 * Talks directly to Supabase tables: scan_history, game_scores, impact_stats.
 * This is the real-database persistence layer that replaces localStorage.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseDataService {

  // ── Scan History ────────────────────────────────────────────────────
  async insertScan(r: WasteItemResult): Promise<void> {
    const { error } = await supabase.from('scan_history').insert({
      item_name: r.itemName,
      category: r.category,
      bin_color: r.binColor,
      disposal: r.disposal,
      eco_tip: r.environmentalTip,
      explanation: r.explanation,
      source: r.source
    });
    if (error) console.error('Supabase insertScan error:', error.message);
  }

  async getRecentHistory(limit = 5): Promise<ScanHistoryItem[]> {
    const { data, error } = await supabase
      .from('scan_history')
      .select('*')
      .order('scanned_at', { ascending: false })
      .limit(limit);

    if (error) { console.error('Supabase getRecentHistory error:', error.message); return []; }

    return (data ?? []).map(row => ({
      id: row.id,
      itemName: row.item_name,
      category: row.category,
      binColor: row.bin_color,
      source: row.source,
      scannedAt: row.scanned_at
    }));
  }

  /** Fetches ALL scan history (used to compute the real category breakdown for the dashboard). */
  async getAllHistory(): Promise<ScanHistoryItem[]> {
    const { data, error } = await supabase
      .from('scan_history')
      .select('id, item_name, category, bin_color, source, scanned_at')
      .order('scanned_at', { ascending: false });

    if (error) { console.error('Supabase getAllHistory error:', error.message); return []; }

    return (data ?? []).map(row => ({
      id: row.id,
      itemName: row.item_name,
      category: row.category,
      binColor: row.bin_color,
      source: row.source,
      scannedAt: row.scanned_at
    }));
  }

  computeBreakdown(history: ScanHistoryItem[]): CategoryBreakdown {
    const b: CategoryBreakdown = { wet: 0, dry: 0, recyclable: 0, hazardous: 0, total: history.length };
    for (const h of history) {
      if (h.category.includes('Wet')) b.wet++;
      else if (h.category.includes('Recyclable')) b.recyclable++;
      else if (h.category.includes('Hazardous')) b.hazardous++;
      else b.dry++;
    }
    return b;
  }

  // ── Impact Stats (single cumulative row) ────────────────────────────
  async getStats(): Promise<ImpactStats> {
    const { data, error } = await supabase
      .from('impact_stats')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error('Supabase getStats error:', error.message);
      return { ...DEFAULT_STATS };
    }

    const totalAnswers = data.total_answers ?? 0;
    const correctAnswers = data.correct_answers ?? 0;
    const accuracyRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    return {
      itemsSegregated: data.items_segregated ?? 0,
      co2Saved: Number(data.co2_saved ?? 0),
      landfillDiverted: Number(data.landfill_diverted ?? 0),
      accuracyRate
    };
  }

  async bumpStatsOnClassify(): Promise<void> {
    const { data } = await supabase.from('impact_stats').select('*').eq('id', 1).maybeSingle();
    const current = data ?? { items_segregated: 0, co2_saved: 0, landfill_diverted: 0 };

    const { error } = await supabase.from('impact_stats').update({
      items_segregated: (current.items_segregated ?? 0) + 1,
      co2_saved: +(Number(current.co2_saved ?? 0) + 0.35).toFixed(2),
      landfill_diverted: +(Number(current.landfill_diverted ?? 0) + 0.60).toFixed(2),
      updated_at: new Date().toISOString()
    }).eq('id', 1);

    if (error) console.error('Supabase bumpStatsOnClassify error:', error.message);
  }

  async applyGameResults(correct: number, wrong: number): Promise<void> {
    const { data } = await supabase.from('impact_stats').select('*').eq('id', 1).maybeSingle();
    const current = data ?? { co2_saved: 0, landfill_diverted: 0, correct_answers: 0, total_answers: 0 };

    const { error } = await supabase.from('impact_stats').update({
      co2_saved: +(Number(current.co2_saved ?? 0) + correct * 0.5).toFixed(2),
      landfill_diverted: +(Number(current.landfill_diverted ?? 0) + correct * 0.8).toFixed(2),
      correct_answers: (current.correct_answers ?? 0) + correct,
      total_answers: (current.total_answers ?? 0) + correct + wrong,
      updated_at: new Date().toISOString()
    }).eq('id', 1);

    if (error) console.error('Supabase applyGameResults error:', error.message);
  }

  // ── Game Scores ──────────────────────────────────────────────────────
  async saveGameScore(payload: GameScorePayload): Promise<void> {
    const { error } = await supabase.from('game_scores').insert({
      score: payload.score,
      total_items: payload.totalItems,
      correct: payload.correct,
      wrong: payload.wrong
    });
    if (error) console.error('Supabase saveGameScore error:', error.message);
  }

  async getRecentScores(limit = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .order('played_at', { ascending: false })
      .limit(limit);
    if (error) { console.error('Supabase getRecentScores error:', error.message); return []; }
    return data ?? [];
  }
}
