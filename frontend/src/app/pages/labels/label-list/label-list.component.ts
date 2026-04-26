import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-label-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>Label Templates</h1>
        <p>Design and manage your label templates</p>
      </div>
      <a routerLink="/labels/create" class="btn btn-primary">
        <span class="material-icons">add</span> New Template
      </a>
    </div>
    <div class="card empty-state">
      <span class="material-icons">construction</span>
      <p>Label template list — coming soon (Phase 4)</p>
    </div>
  `,
})
export class LabelListComponent {}
