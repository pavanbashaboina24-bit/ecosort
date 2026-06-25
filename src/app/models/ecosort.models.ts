export interface WasteItemResult {
  itemName: string;
  category: 'Wet Waste' | 'Dry Waste' | 'Recyclable Waste' | 'Hazardous Waste';
  binColor: string;
  disposal: string;
  environmentalTip: string;
  explanation: string;
  source: string;
  /** False when the input couldn't be identified as a real waste item
   *  (gibberish, random text, etc). When false, the other fields above
   *  are not meaningful and the UI should show the "not recognized" state. */
  recognized: boolean;
}

export interface ScanHistoryItem {
  id: number;
  itemName: string;
  category: string;
  binColor: string;
  source: string;
  scannedAt: string;
}

export interface ImpactStats {
  itemsSegregated: number;
  co2Saved: number;
  landfillDiverted: number;
  accuracyRate: number;
}

/** Real category breakdown computed from actual scan history (replaces hardcoded pie chart). */
export interface CategoryBreakdown {
  wet: number;
  dry: number;
  recyclable: number;
  hazardous: number;
  total: number;
}

export interface GameItem {
  id: number;
  name: string;
  correctCategory: string;
  icon: string;
}

export interface GameScorePayload {
  score: number;
  totalItems: number;
  correct: number;
  wrong: number;
}

/** Summary shown on the game's results screen after a round completes. */
export interface GameSummary {
  score: number;
  totalItems: number;
  correct: number;
  wrong: number;
  accuracy: number;
  bestStreak: number;
  timeTakenSec: number;
}
