import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>Order Details</h1>
      </div>
      <a routerLink="/orders" class="btn btn-ghost">
        <span class="material-icons">arrow_back</span> Back
      </a>
    </div>
    <div class="card empty-state">
      <span class="material-icons">construction</span>
      <p>Order detail view — coming soon (Phase 3)</p>
    </div>
  `,
})
export class OrderDetailComponent {}
