import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <p>© 2026 EcoSort AI. Built for Smart Sustainability Internship.</p>
        <div class="footer-links">
          <span>Privacy Guidelines</span>
          <span>Technical Report</span>
          <span>Git Repository</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer { border-top: 1px solid #f1f5f9; background: rgba(255,255,255,0.5); padding: 1.5rem clamp(1rem, 4vw, 3rem); }
    .footer-inner { width: 100%; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: 0.75rem; color: #64748b; }
    .footer-links { display: flex; gap: 1.5rem; }
    .footer-links span { cursor: pointer; transition: color 0.15s; }
    .footer-links span:hover { color: #16a34a; }
  `]
})
export class FooterComponent {}
