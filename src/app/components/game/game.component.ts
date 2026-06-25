import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteService } from '../../services/waste.service';
import { GameItem, GameSummary } from '../../models/ecosort.models';
import { GAME_ITEM_BANK } from './game-items.data';

const BINS = [
  { label: 'Wet Waste',        binLabel: 'Green Bin', icon: '♻️', style: 'wet' },
  { label: 'Dry Waste',        binLabel: 'Grey Bin',  icon: '📦', style: 'dry' },
  { label: 'Recyclable Waste', binLabel: 'Blue Bin',  icon: '🥤', style: 'recycle' },
  { label: 'Hazardous Waste',  binLabel: 'Red Bin',   icon: '⚠️', style: 'hazardous' }
];

/** Number of items played per round. The bank itself holds 100+ items; each round samples this many. */
const ROUND_LENGTH = 15;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  itemBank = GAME_ITEM_BANK;
  bins = BINS;

  gameItems = signal<GameItem[]>(this.pickRound());
  score = signal(0);
  currentIndex = signal(0);
  completed = signal(false);
  feedback = signal<{ correct: boolean; text: string } | null>(null);
  summary = signal<GameSummary | null>(null);
  locked = false;

  correctCount = 0;
  wrongCount = 0;
  streak = 0;
  bestStreak = 0;
  startTime = Date.now();

  get currentItem() { return this.gameItems()[this.currentIndex()]; }
  get progress()    { return (this.currentIndex() / this.gameItems().length) * 100; }
  get totalItemsInBank() { return this.itemBank.length; }

  constructor(private wasteService: WasteService) {}

  private pickRound(): GameItem[] {
    return shuffle(this.itemBank).slice(0, ROUND_LENGTH);
  }

  answer(category: string) {
    if (this.locked) return;
    this.locked = true;
    const correct = this.currentItem.correctCategory === category;

    if (correct) {
      this.correctCount++;
      this.streak++;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
    } else {
      this.wrongCount++;
      this.streak = 0;
    }

    this.feedback.set({
      correct,
      text: correct
        ? `✅ Correct! ${this.currentItem.name} goes to ${category}!`
        : `❌ Oops! ${this.currentItem.name} belongs in ${this.currentItem.correctCategory}.`
    });

    if (correct) this.score.update(s => s + 10);

    setTimeout(async () => {
      this.feedback.set(null);
      if (this.currentIndex() < this.gameItems().length - 1) {
        this.currentIndex.update(i => i + 1);
      } else {
        await this.finishRound();
      }
      this.locked = false;
    }, 1400);
  }

  private async finishRound() {
    const timeTakenSec = Math.round((Date.now() - this.startTime) / 1000);
    const total = this.gameItems().length;
    const accuracy = total > 0 ? Math.round((this.correctCount / total) * 100) : 0;

    const summary: GameSummary = {
      score: this.score(),
      totalItems: total,
      correct: this.correctCount,
      wrong: this.wrongCount,
      accuracy,
      bestStreak: this.bestStreak,
      timeTakenSec
    };
    this.summary.set(summary);

    await this.wasteService.saveGameScore({
      score: summary.score,
      totalItems: summary.totalItems,
      correct: summary.correct,
      wrong: summary.wrong
    });
    await this.wasteService.updateGameResult(summary.correct, summary.wrong);

    this.completed.set(true);
  }

  reset() {
    this.gameItems.set(this.pickRound());
    this.score.set(0);
    this.currentIndex.set(0);
    this.completed.set(false);
    this.feedback.set(null);
    this.summary.set(null);
    this.locked = false;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.startTime = Date.now();
  }
}
