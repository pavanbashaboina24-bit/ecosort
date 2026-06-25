import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss']
})
export class DocumentationComponent {
  designSteps = [
    { num: '1', title: 'Empathize', text: 'Citizens are highly confused with municipal color schemes and are in severe rush at disposal points.' },
    { num: '2', title: 'Define',    text: 'Lack of intuitive instantaneous verification tools causes contamination at waste streams.' },
    { num: '3', title: 'Ideate',    text: 'Create a direct voice, camera, and input powered chatbot classifier requiring zero reading.' },
    { num: '4', title: 'Prototype', text: 'Design this responsive Angular web interface coupled to live AI and a cloud database for real-world execution.' },
    { num: '5', title: 'Test',      text: 'Track user actions, error rates, and continuously refine classification accuracy using real scan data.' }
  ];

  techStack = [
    { layer: 'Frontend',      tech: 'Angular 17 (Standalone Components)', purpose: 'Reactive, component-driven UI with signals for state management.' },
    { layer: 'Language',      tech: 'TypeScript',                          purpose: 'Type-safe application logic across all components and services.' },
    { layer: 'Styling',       tech: 'SCSS',                                purpose: 'Modular, scoped component styling and design tokens.' },
    { layer: 'AI Engine',     tech: 'Google Gemini 2.5 Flash API',         purpose: 'Live, real-world waste classification for any item typed by the user.' },
    { layer: 'Database',      tech: 'Supabase (PostgreSQL)',               purpose: 'Cloud-hosted storage for scan history, impact stats, and game scores.' },
    { layer: 'Data Client',   tech: '@supabase/supabase-js',                purpose: 'Browser SDK used to read/write Supabase tables directly from Angular.' },
    { layer: 'Routing',       tech: 'Angular Router',                      purpose: 'Client-side navigation between Assistant, Game, Dashboard, Docs, and Presentation tabs.' },
    { layer: 'Hosting Target', tech: 'Static Angular Build (ng build)',     purpose: 'Deployable to any static host (Vercel, Netlify, GitHub Pages, etc.) since there is no custom backend server.' }
  ];

  architectureNotes = [
    { icon: '🧠', title: 'Live AI Classification',
      text: 'Every item typed into the AI Assistant is sent to the Gemini API in real time, so the response is genuinely computed per item rather than a fixed canned answer. If the AI call fails or is unavailable, a local heuristics database takes over automatically.' },
    { icon: '☁️', title: 'Real Cloud Database',
      text: 'Scan history, impact statistics, and sorting-game scores are written directly to Supabase (PostgreSQL) tables, so the Impact Tracker reflects real accumulated activity rather than mock numbers. There is no local/offline storage — Supabase is the single source of truth.' },
    { icon: '🔌', title: 'Resilient Error Handling',
      text: 'If a Supabase write or read fails (e.g. a network blip), the error is logged and surfaced gracefully in the UI rather than silently faking data — nothing is ever invented client-side.' }
  ];

  responsibleAI = [
    { icon: '⚖️', title: 'Fairness & Inclusion',
      text: 'The system uses localized keyword tagging so common regional names for fruits, packaging, or items yield appropriate results, independent of regional dialects.' },
    { icon: '👁️', title: 'Transparency',
      text: 'The system provides a clear "Scientific Rationale" block with every output so the user understands exactly why an item belongs to a specific category.' },
    { icon: '🔒', title: 'Privacy Protected',
      text: 'No facial tracking or unnecessary household personal metadata collected. Classification is purely item-based with zero user data retention.' },
    { icon: '🛡️', title: 'Reliability',
      text: 'Solid fallback mechanisms ensure the system operates even if external API signals are lost, with local heuristics maintaining core functionality.' }
  ];

  futureItems = [
    { title: 'Computer Vision Integration', text: 'Hooking up visual feeds from trash bins directly to Edge AI modules to auto-classify items on drop.' },
    { title: 'IoT Solenoid Bins',           text: 'Actuators automatically driving mechanical bin lids open based on target categories detected by the AI.' },
    { title: 'Localized Vernacular Speech', text: 'Audio integration for public spaces to aid illiterate or visually impaired citizens with spoken instructions.' },
    { title: 'Gamified Carbon Credits',     text: 'QR code scanning to award verified carbon credits to citizens who consistently segregate correctly.' }
  ];
}
