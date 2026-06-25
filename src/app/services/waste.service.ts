import { Injectable } from '@angular/core';
import { WasteItemResult, ScanHistoryItem, ImpactStats, GameScorePayload, CategoryBreakdown } from '../models/ecosort.models';
import { GeminiService } from './gemini.service';
import { SupabaseDataService } from './supabase-data.service';

const LOCAL_DB: Record<string, Omit<WasteItemResult, 'itemName' | 'source'>> = {
  'banana peel':   { recognized: true, category: 'Wet Waste',        binColor: 'Green',    disposal: 'Dispose in the Green Compost Bin.',                              environmentalTip: 'Organic waste decomposes into rich nutrients. Composting reduces methane emissions.', explanation: 'Organic food remains decompose naturally and make excellent compost.' },
  'apple core':    { recognized: true, category: 'Wet Waste',        binColor: 'Green',    disposal: 'Dispose in the Green Compost Bin.',                              environmentalTip: 'Food waste creates rich compost for local agriculture.',                           explanation: 'Biodegradable organic matter that breaks down safely.' },
  'egg shells':    { recognized: true, category: 'Wet Waste',        binColor: 'Green',    disposal: 'Crush and place in the Green Compost Bin.',                      environmentalTip: 'Calcium from eggshells strengthens soil structure in gardens.',                    explanation: 'Natural organic calcium-rich shell that degrades naturally.' },
  'plastic bottle':{ recognized: true, category: 'Recyclable Waste', binColor: 'Blue',     disposal: 'Empty, crush, and place in the Blue Recycling Bin.',             environmentalTip: 'Recycling plastic saves 84% of the energy needed for new plastics.',             explanation: 'PET/HDPE containers are highly recyclable materials.' },
  'soda can':      { recognized: true, category: 'Recyclable Waste', binColor: 'Blue',     disposal: 'Rinse and place in the Blue Recycling Bin.',                     environmentalTip: 'Aluminium can be recycled indefinitely without losing its properties.',           explanation: 'Metals like aluminium can be melted down and reshaped efficiently.' },
  'glass bottle':  { recognized: true, category: 'Recyclable Waste', binColor: 'Blue',     disposal: 'Rinse, remove caps, and place in the Blue Recycling Bin.',       environmentalTip: 'Glass recycling saves raw materials and energy used in furnace firing.',          explanation: 'Glass is 100% recyclable and can be recycled endlessly.' },
  'newspaper':     { recognized: true, category: 'Dry Waste',        binColor: 'Blue/Grey',disposal: 'Keep dry, fold, and place in the Dry/Paper Recycling Bin.',      environmentalTip: 'One ton of recycled paper saves 17 trees and 7,000 gallons of water.',          explanation: 'Clean dry paper is processed back into wood pulp.' },
  'cardboard box': { recognized: true, category: 'Dry Waste',        binColor: 'Blue/Grey',disposal: 'Flatten and place in the Dry/Paper Recycling Bin.',              environmentalTip: 'Flattened cardboard occupies less volume and lowers transport emissions.',        explanation: 'Corrugated cardboard is highly valued in dry material recycling.' },
  'battery':       { recognized: true, category: 'Hazardous Waste',  binColor: 'Red/Black',disposal: 'Do NOT throw in normal bins. Take to an E-Waste Collection Center.', environmentalTip: 'Batteries contain toxic heavy metals that leach into water tables.',       explanation: 'Corrosive chemicals and heavy metals require specialized handling.' },
  'led bulb':      { recognized: true, category: 'Hazardous Waste',  binColor: 'Red/Black',disposal: 'Package safely and drop off at hazardous waste collection points.', environmentalTip: 'Bulbs contain circuitry and trace heavy metals posing ecological hazards.',  explanation: 'Electronic elements and mercury coatings are toxic municipal waste.' },
  'food waste':    { recognized: true, category: 'Wet Waste',        binColor: 'Green',    disposal: 'Dispose in the Green Compost Bin.',                              environmentalTip: 'Composting food waste reduces landfill methane by up to 50%.',                  explanation: 'Organic kitchen waste decomposes into nutrient-rich compost.' },
  'milk carton':   { recognized: true, category: 'Recyclable Waste', binColor: 'Blue',     disposal: 'Rinse, flatten, and place in the Blue Recycling Bin.',           environmentalTip: 'Cartons are made of paper, plastic and aluminium — all recoverable.',           explanation: 'Multi-layer cartons can be separated and recycled at facilities.' },
  'plastic bag':   { recognized: true, category: 'Dry Waste',        binColor: 'Blue/Grey',disposal: 'Take to store drop-off points for plastic film recycling.',      environmentalTip: 'Plastic bags can choke marine life — never bin them loose.',                    explanation: 'Soft plastics require specialized recycling outside curbside bins.' },
  'medicine':      { recognized: true, category: 'Hazardous Waste',  binColor: 'Red/Black',disposal: 'Return to pharmacy — never flush or bin medications.',           environmentalTip: 'Flushed medicines contaminate drinking water supplies.',                         explanation: 'Pharmaceutical chemicals require controlled disposal.' },
  'mobile phone':  { recognized: true, category: 'Hazardous Waste',  binColor: 'Red/Black',disposal: 'Take to an authorised E-Waste collection or manufacturer store.', environmentalTip: 'One phone contains rare earth metals worth recovering.',                       explanation: 'Electronics contain lead, mercury and cadmium requiring safe disposal.' },

  // ── Liquid waste ──────────────────────────────────────────────────────
  'alcohol':       { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Pour down the sink with running water, or dispose with other wet/liquid waste — do not bin the empty bottle, recycle that separately.', environmentalTip: 'Small amounts of alcohol are biodegradable and break down safely with water treatment.', explanation: 'A biodegradable liquid that is treated as wet/organic-compatible waste in small household quantities.' },
  'liquor':        { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Pour down the sink with running water; recycle the bottle separately.', environmentalTip: 'Alcoholic beverages break down naturally and do not require hazardous handling in small amounts.', explanation: 'Biodegradable liquid waste, safe for standard wastewater disposal.' },
  'milk':          { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Pour down the sink/drain; recycle the container separately.', environmentalTip: 'Dairy liquids biodegrade but should not be poured on soil/plants directly.', explanation: 'Organic liquid waste, safely handled through standard wastewater systems.' },
  'juice':         { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Pour down the sink/drain; recycle the container separately.', environmentalTip: 'Fruit-based liquid waste is fully biodegradable.', explanation: 'Organic liquid matter, safe for standard drainage disposal.' },
  'cooking oil':   { recognized: true, category: 'Hazardous Waste', binColor: 'Red/Black', disposal: 'Never pour down the drain. Collect in a sealed container and take to a used-oil collection point.', environmentalTip: 'Cooking oil clogs pipes and contaminates water bodies if poured down drains.', explanation: 'Oils do not biodegrade easily in water systems and require special handling.' },
  'petrol':        { recognized: true, category: 'Hazardous Waste', binColor: 'Red/Black', disposal: 'Take to a hazardous waste/fuel collection facility. Never pour into drains or soil.', environmentalTip: 'Petroleum products are highly flammable and toxic to groundwater.', explanation: 'A flammable hydrocarbon requiring specialized hazardous-waste handling.' },

  // ── Fruits ──────────────────────────────────────────────────────────
  'apple':         { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose whole/cut scraps in the Green Compost Bin.', environmentalTip: 'Fruit scraps compost quickly and enrich garden soil.', explanation: 'Biodegradable plant matter breaks down naturally.' },
  'banana':        { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose the peel in the Green Compost Bin.', environmentalTip: 'Banana peels are rich in potassium and compost fast.', explanation: 'Organic fruit waste decomposes naturally without leaving residue.' },
  'orange':        { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose peel and pulp in the Green Compost Bin.', environmentalTip: 'Citrus peels add nutrients but compost slightly slower — chop them up first.', explanation: 'Organic citrus matter is biodegradable plant waste.' },
  'mango':         { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose peel and seed in the Green Compost Bin.', environmentalTip: 'Mango waste decomposes into nutrient-rich compost.', explanation: 'Organic fruit matter breaks down naturally.' },
  'watermelon':    { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Cut the rind into pieces and dispose in the Green Compost Bin.', environmentalTip: 'Large rinds compost best when chopped into smaller pieces.', explanation: 'High-moisture organic matter decomposes quickly.' },
  'grapes':        { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose in the Green Compost Bin.', environmentalTip: 'Soft fruit waste composts very quickly.', explanation: 'Organic plant matter is fully biodegradable.' },
  'pineapple':     { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Chop the husk and dispose in the Green Compost Bin.', environmentalTip: 'Tough fibrous husks compost best in smaller pieces.', explanation: 'Organic fibrous plant matter breaks down over time.' },
  'papaya':        { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose skin and seeds in the Green Compost Bin.', environmentalTip: 'Papaya waste enriches compost with natural enzymes.', explanation: 'Organic fruit matter decomposes readily.' },
  'guava':         { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose in the Green Compost Bin.', environmentalTip: 'Fruit scraps make excellent nutrient-rich compost.', explanation: 'Biodegradable organic plant matter.' },
  'pomegranate':   { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose rind and pith in the Green Compost Bin.', environmentalTip: 'Tannin-rich peels compost well alongside other greens.', explanation: 'Organic fruit waste breaks down naturally.' },

  // ── Vegetables ──────────────────────────────────────────────────────
  'potato peel':   { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose in the Green Compost Bin.', environmentalTip: 'Vegetable peels are a great source of compost nitrogen.', explanation: 'Organic plant matter decomposes naturally.' },
  'onion peel':    { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose in the Green Compost Bin.', environmentalTip: 'Onion skins break down well mixed with other compost.', explanation: 'Biodegradable organic plant matter.' },
  'tomato':        { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose in the Green Compost Bin.', environmentalTip: 'High-moisture vegetable waste composts quickly.', explanation: 'Organic plant matter is fully biodegradable.' },
  'carrot':        { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose peels/scraps in the Green Compost Bin.', environmentalTip: 'Root vegetable scraps decompose into nutrient-dense compost.', explanation: 'Organic plant matter breaks down naturally.' },
  'cucumber':      { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose in the Green Compost Bin.', environmentalTip: 'High water content vegetable scraps compost rapidly.', explanation: 'Biodegradable organic matter.' },
  'cabbage':       { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose outer leaves and core in the Green Compost Bin.', environmentalTip: 'Leafy vegetable waste enriches compost quickly.', explanation: 'Organic plant matter decomposes readily.' },
  'spinach':       { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose wilted leaves in the Green Compost Bin.', environmentalTip: 'Leafy greens break down fast and add nitrogen to compost.', explanation: 'Soft organic plant matter is highly biodegradable.' },
  'brinjal':       { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose in the Green Compost Bin.', environmentalTip: 'Vegetable scraps decompose into useful garden compost.', explanation: 'Organic plant matter breaks down naturally.' },
  'capsicum':      { recognized: true, category: 'Wet Waste', binColor: 'Green', disposal: 'Dispose seeds and stem in the Green Compost Bin.', environmentalTip: 'Vegetable trimmings make rich compost material.', explanation: 'Biodegradable organic plant matter.' },
};

const DEFAULT_STATS: ImpactStats = { itemsSegregated: 0, co2Saved: 0, landfillDiverted: 0, accuracyRate: 0 };

/**
 * Classifies waste items via the Gemini AI (real, per-item answers) and
 * persists ALL application data exclusively to Supabase. There is no
 * localStorage/offline mirror — Supabase is the single source of truth
 * for scan history, impact stats, and game scores.
 */
@Injectable({ providedIn: 'root' })
export class WasteService {

  constructor(
    private gemini: GeminiService,
    private db: SupabaseDataService
  ) {}

  // ── Classification ─────────────────────────────────────────────────
  /**
   * Classifies a waste item.
   * 1) Tries the Gemini API for a real, item-specific AI answer (it can
   *    itself report "not recognized" for gibberish/non-item input).
   * 2) Falls back to the local heuristics database only if Gemini is not
   *    configured or the call fails (e.g. offline / quota / network) —
   *    the local fallback also detects gibberish instead of guessing.
   * Recognized results are persisted directly to Supabase.
   */
  async classify(itemName: string): Promise<WasteItemResult> {
    const key = itemName.toLowerCase().trim();

    const aiMatch = await this.gemini.classify(itemName);
    let result: WasteItemResult;

    if (aiMatch) {
      result = { itemName, source: 'Gemini AI', ...aiMatch };
    } else {
      const localMatch = LOCAL_DB[key] ?? this.keywordFallback(key);
      result = { itemName, source: 'Local Database', ...localMatch };
    }

    if (result.recognized) {
      await this.persistScan(result);
    }
    return result;
  }

  /** Returns true if the input looks like real text (not gibberish/random
   *  keyboard mashing) — i.e. it's at least plausible as an item name.
   *  This is only a last-resort safety net for when Gemini itself is
   *  unreachable; Gemini's own judgement (see GeminiService) is the
   *  primary line of defense against gibberish input. */
  private looksLikeRealWord(key: string): boolean {
    if (!key || key.length < 2) return false;
    // Common keyboard-row mashing patterns ("asdf", "qwerty", "zxcvbn", etc).
    if (/^(asdf|qwer|zxcv|qwerty|asdfgh|zxcvbn|jkl|hjkl)[a-z]*$/i.test(key)) return false;
    // Must contain at least one vowel (almost every real English/Hindi-
    // transliterated item name does).
    if (!/[aeiou]/i.test(key)) return false;
    // Reject strings with long unbroken consonant runs (typical of random mashing).
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(key)) return false;
    // Reject single-token strings with no real vowel-consonant alternation
    // (very few real words exceed ~14 letters as a single token).
    if (/^[a-z]+$/i.test(key) && key.length > 14) return false;
    return true;
  }

  private keywordFallback(key: string): Omit<WasteItemResult, 'itemName' | 'source'> {
    // Hazardous liquids first (oil, fuel, chemicals) — checked before the generic
    // "liquid" rule below so these don't get miscategorised as Wet Waste.
    if (/(petrol|diesel|kerosene|thinner|pesticide|motor oil|engine oil|cooking oil|used oil|paint|solvent|acid|bleach)/.test(key))
      return LOCAL_DB['petrol'];
    // Ordinary drinkable/biodegradable liquids — any liquid waste is Wet Waste.
    if (/(alcohol|liquor|wine|beer|whisky|whiskey|vodka|rum|spirit|milk|juice|soda|liquid|water|beverage|drink|soup|broth|curry|gravy|tea|coffee)/.test(key))
      return LOCAL_DB['alcohol'];
    if (/(peel|core|rotten|vegetable|fruit|leftover|food|cooked|apple|banana|orange|mango|melon|grape|pineapple|papaya|guava|pomegranate|potato|onion|tomato|carrot|cucumber|cabbage|spinach|brinjal|capsicum|veggie|leaf|leaves)/.test(key))
      return LOCAL_DB['banana peel'];
    if (/(plastic|bottle|can|tin|metal|alumin|container)/.test(key))
      return LOCAL_DB['plastic bottle'];
    if (/(battery|phone|electronic|cable|charger|chemical|medicine|spray)/.test(key))
      return LOCAL_DB['battery'];
    if (/(paper|cardboard|newspaper|magazine|carton|book)/.test(key))
      return LOCAL_DB['newspaper'];

    // Nothing matched a known waste-related keyword. Only guess "Dry Waste"
    // if this still looks like a real word/item we simply don't have data for;
    // otherwise, be honest and say it isn't recognized rather than faking it.
    if (this.looksLikeRealWord(key)) {
      return {
        recognized: true,
        category: 'Dry Waste', binColor: 'Blue/Grey',
        disposal: 'Place in standard dry waste compartments.',
        environmentalTip: 'Dry waste is non-hazardous — keep it separate from wet waste.',
        explanation: 'This item is categorised as dry solid waste — stable and non-perishable.'
      };
    }

    return {
      recognized: false,
      category: 'Dry Waste', binColor: '', disposal: '', environmentalTip: '', explanation: ''
    };
  }

  private async persistScan(result: WasteItemResult): Promise<void> {
    try {
      await this.db.insertScan(result);
      await this.db.bumpStatsOnClassify();
    } catch (err) {
      console.error('Supabase write failed:', err);
    }
  }

  // ── History ──────────────────────────────────────────────────────────
  async getRecentHistory(): Promise<ScanHistoryItem[]> {
    return this.db.getRecentHistory(5);
  }

  /** Real category breakdown for the dashboard pie chart, computed from actual scans. */
  async getBreakdown(): Promise<CategoryBreakdown> {
    const all = await this.db.getAllHistory();
    return this.db.computeBreakdown(all);
  }

  // ── Stats ────────────────────────────────────────────────────────────
  async getStats(): Promise<ImpactStats> {
    try {
      return await this.db.getStats();
    } catch (err) {
      console.error('Supabase getStats failed:', err);
      return { ...DEFAULT_STATS };
    }
  }

  async updateGameResult(correct: number, wrong: number): Promise<void> {
    try {
      await this.db.applyGameResults(correct, wrong);
    } catch (err) {
      console.error('Supabase game-result update failed:', err);
    }
  }

  // ── Game Scores ──────────────────────────────────────────────────────
  async saveGameScore(payload: GameScorePayload): Promise<void> {
    try {
      await this.db.saveGameScore(payload);
    } catch (err) {
      console.error('Supabase saveGameScore failed:', err);
    }
  }
}
