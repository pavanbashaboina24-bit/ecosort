import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiKeyService } from '../../services/api-key.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  showModal = false;
  tempKey = '';

  constructor(private apiKeyService: ApiKeyService) {}

  get hasCustomKey() { return this.apiKeyService.hasOverride(); }

  openModal() {
    this.tempKey = this.apiKeyService.hasOverride() ? this.apiKeyService.activeKey() : '';
    this.showModal = true;
  }
  saveKey() { this.apiKeyService.setOverride(this.tempKey); this.showModal = false; }
  clearKey() { this.apiKeyService.clearOverride(); this.tempKey = ''; this.showModal = false; }

  navLinks = [
    { path: '/assistant',     label: 'AI Assistant',   icon: '🤖' },
    { path: '/game',          label: 'Sorting Game',   icon: '🎮' },
    { path: '/dashboard',     label: 'Impact Tracker', icon: '📊' },
    { path: '/documentation', label: 'Project Docs',   icon: '📄' },
    { path: '/presentation',  label: 'Presentation',   icon: '🖥️'  }
  ];
}
