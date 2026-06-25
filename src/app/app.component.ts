import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="app-shell">
      <app-header />
      <main class="main-content">
        <div class="content-wrapper">
          <router-outlet />
        </div>
      </main>
      <app-footer />
    </div>
  `,
  styles: [`
    .app-shell { display: flex; flex-direction: column; min-height: 100vh; width: 100%; }
    .main-content { flex: 1; width: 100%; }
    .content-wrapper { width: 100%; margin: 0 auto; padding: 2rem clamp(1rem, 4vw, 3rem); }
    @media (max-width: 768px) { .content-wrapper { padding: 1rem; } }
  `]
})
export class AppComponent {}
