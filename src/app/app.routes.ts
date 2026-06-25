import { Routes } from '@angular/router';
import { AssistantComponent } from './components/assistant/assistant.component';
import { GameComponent } from './components/game/game.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { PresentationComponent } from './components/presentation/presentation.component';

export const routes: Routes = [
  { path: '', redirectTo: 'assistant', pathMatch: 'full' },
  { path: 'assistant', component: AssistantComponent },
  { path: 'game', component: GameComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'documentation', component: DocumentationComponent },
  { path: 'presentation', component: PresentationComponent },
  { path: '**', redirectTo: 'assistant' }
];
