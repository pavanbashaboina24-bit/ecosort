import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { WasteItemResult } from '../models/ecosort.models';
import { ApiKeyService } from './api-key.service';

/**
 * Calls the Gemini API to classify a waste item in real time.
 * The model is instructed to return strict JSON matching WasteItemResult
 * (minus itemName/source, which we attach ourselves) so every distinct
 * input produces a genuinely different, real-world answer instead of a
 * static canned response.
 */
@Injectable({ providedIn: 'root' })
export class GeminiService {

  /** Set whenever the last Gemini call failed, so the UI can surface the
   *  real reason instead of silently falling back to the local database. */
  lastError = signal<string | null>(null);

  constructor(private apiKeyService: ApiKeyService) {}

  private endpoint(): string {
    const key = this.apiKeyService.activeKey();
    return `https://generativelanguage.googleapis.com/v1beta/models/${environment.geminiModel}:generateContent?key=${key}`;
  }

  /** True when a Gemini key is configured at all. We don't hard-validate the
   *  format here — if it's wrong, the actual API call will fail and we
   *  gracefully fall back to the local database. */
  isConfigured(): boolean {
    const key = this.apiKeyService.activeKey() || '';
    return key.trim().length > 10;
  }

  /**
   * Returns a full classification, a "not recognized" result (recognized: false),
   * or null if the API call itself couldn't be completed (not configured, network
   * error, malformed response, etc — in which case the caller falls back to the
   * local database).
   */
  async classify(itemName: string): Promise<Omit<WasteItemResult, 'itemName' | 'source'> | null> {
    if (!this.isConfigured()) {
      this.lastError.set('No Gemini API key configured.');
      return null;
    }
    this.lastError.set(null);

    const prompt = `You are a waste-segregation classification engine for an Indian municipal smart-bin system.
The user typed: "${itemName}".

First decide whether this is an actual identifiable physical item/material that could plausibly be thrown away
(household waste, food/fruit/vegetable, packaging, electronics, furniture, clothing, etc — in any language or
with minor typos/spelling mistakes are fine). If it is gibberish, random keyboard text, an empty/meaningless
string, a question, a greeting, or anything that is not a real physical item, it is NOT recognized.

Category guidance: any liquid waste (water, alcohol/liquor, milk, juice, oil, cooking liquid, beverages, etc)
counts as Wet Waste, the same as food scraps — liquids should NOT be classified as Dry Waste. Use Hazardous
Waste only for liquids that are toxic/chemical/flammable in a way that needs special handling (e.g. paint
thinner, petrol, pesticide, motor oil), not for ordinary drinkable liquids like alcohol or beverages.

Respond with ONLY raw, strictly valid JSON — no markdown fences, no preamble, no comments, no trailing
commas, no line breaks inside string values, and every key and string value double-quoted exactly as shown below.

If NOT recognized, respond in exactly this shape:
{
  "recognized": false
}

If it IS a real item, respond in exactly this shape:
{
  "recognized": true,
  "category": "Wet Waste" | "Dry Waste" | "Recyclable Waste" | "Hazardous Waste",
  "binColor": "<short bin color/name, e.g. Green, Blue, Blue/Grey, Red/Black>",
  "disposal": "<one short actionable sentence on how to dispose of it>",
  "environmentalTip": "<one short real-world environmental fact/impact tip about disposing this correctly>",
  "explanation": "<one short scientific/material-science reason why it belongs in this category>"
}

Use real, specific, accurate information for THIS exact item — do not return generic or repeated answers across
different items. Only mark something unrecognized if it genuinely isn't an identifiable physical item — do not
mark real items as unrecognized just because they're unusual or you're unsure of the exact category; make your
best real-world judgement in that case instead.`;

    try {
      const response = await fetch(this.endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 500,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error('Gemini API error:', response.status, errBody);
        this.lastError.set(`Gemini API error ${response.status}: ${errBody.slice(0, 200)}`);
        return null;
      }

      const data = await response.json();
      const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        this.lastError.set('Gemini returned an empty response.');
        return null;
      }

      const cleaned = text.replace(/```json|```/g, '').trim();

      // Gemini occasionally wraps the JSON in extra text/formatting even with
      // responseMimeType: 'application/json'. Extract just the {...} block
      // (the first '{' to the matching last '}') before parsing, so stray
      // characters around the object don't break JSON.parse.
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      const jsonSlice = firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
        ? cleaned.slice(firstBrace, lastBrace + 1)
        : cleaned;

      let parsed: any;
      try {
        parsed = JSON.parse(jsonSlice);
      } catch (parseErr) {
        console.error('Gemini JSON parse failed. Raw text was:', text);
        this.lastError.set(`Gemini returned malformed JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
        return null;
      }

      if (parsed.recognized === false) {
        return {
          recognized: false,
          category: 'Dry Waste',
          binColor: '',
          disposal: '',
          environmentalTip: '',
          explanation: ''
        };
      }

      if (!parsed.category || !parsed.binColor || !parsed.disposal) {
        this.lastError.set('Gemini response was missing required fields.');
        return null;
      }

      return {
        recognized: true,
        category: parsed.category,
        binColor: parsed.binColor,
        disposal: parsed.disposal,
        environmentalTip: parsed.environmentalTip ?? '',
        explanation: parsed.explanation ?? ''
      };
    } catch (err) {
      console.error('Gemini classification failed:', err);
      this.lastError.set(`Gemini call failed: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }
}
