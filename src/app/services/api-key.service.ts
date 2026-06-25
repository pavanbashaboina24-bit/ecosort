import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Holds the active Gemini API key for the whole app.
 * Defaults to the key baked into environment.ts. If the user sets a
 * different key via the header's "Set API Key" modal, that override is
 * kept in memory for the current session only (no localStorage — all
 * persistent app data lives in Supabase, not the browser).
 */
@Injectable({ providedIn: 'root' })
export class ApiKeyService {
  private override = signal<string>('');

  /** The key actually used for Gemini calls: user override if set, else the environment default. */
  activeKey(): string {
    return this.override() || environment.geminiApiKey;
  }

  /** True if the user has manually set a custom key (vs using the default). */
  hasOverride(): boolean {
    return !!this.override();
  }

  setOverride(key: string) {
    this.override.set(key.trim());
  }

  clearOverride() {
    this.override.set('');
  }
}
