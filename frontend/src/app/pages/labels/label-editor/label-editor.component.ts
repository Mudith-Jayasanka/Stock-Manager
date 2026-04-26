import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-label-editor',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>Label Editor</h1>
        <p>Design your custom label</p>
      </div>
      <a routerLink="/labels" class="btn btn-ghost">
        <span class="material-icons">arrow_back</span> Back
      </a>
    </div>
    <div class="card empty-state">
      <span class="material-icons">construction</span>
      <p>Label editor canvas (Fabric.js) — coming soon (Phase 4)</p>
    </div>
  `,
})
export class LabelEditorComponent {}
