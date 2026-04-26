import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>Create Order</h1>
        <p>Enter customer details and select products</p>
      </div>
      <a routerLink="/orders" class="btn btn-ghost">
        <span class="material-icons">arrow_back</span> Back
      </a>
    </div>
    <div class="card empty-state">
      <span class="material-icons">construction</span>
      <p>Order creation form — coming soon (Phase 3)</p>
    </div>
  `,
})
export class OrderCreateComponent {}
