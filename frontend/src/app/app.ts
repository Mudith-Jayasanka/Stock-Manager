import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <!-- Sidebar Navigation -->
      <nav class="sidebar">
        <div class="sidebar-logo">
          <span class="material-icons">label</span>
          <span class="logo-text">Label<strong>Print</strong></span>
        </div>

        <ul class="nav-links">
          <li>
            <a routerLink="/orders" routerLinkActive="active">
              <span class="material-icons">receipt_long</span>
              Orders
            </a>
          </li>
          <li>
            <a routerLink="/customers" routerLinkActive="active">
              <span class="material-icons">people</span>
              Customers
            </a>
          </li>
          <li>
            <a routerLink="/products" routerLinkActive="active">
              <span class="material-icons">inventory_2</span>
              Products
            </a>
          </li>
          <li>
            <a routerLink="/labels" routerLinkActive="active">
              <span class="material-icons">dashboard_customize</span>
              Labels
            </a>
          </li>
          <li>
            <a routerLink="/master-data" routerLinkActive="active">
              <span class="material-icons">tune</span>
              Master Data
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <span class="material-icons">circle</span>
          <span>Mock DB Active</span>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="page-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      height: 100vh;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 22px 20px;
      border-bottom: 1px solid var(--border);
      color: var(--accent);
      font-size: 16px;
      .material-icons { font-size: 24px; }
      .logo-text { color: var(--text-secondary); strong { color: var(--text-primary); } }
    }

    .nav-links {
      list-style: none;
      padding: 12px 10px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;

      a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        transition: all var(--transition);

        .material-icons { font-size: 18px; }

        &:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        &.active {
          background: var(--accent-dim);
          color: var(--accent-light);
          .material-icons { color: var(--accent); }
        }
      }
    }

    .sidebar-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      border-top: 1px solid var(--border);
      font-size: 11px;
      color: var(--text-muted);
      .material-icons { font-size: 10px; color: var(--success); }
    }
  `]
})
export class App {
  title = 'Label Print';
}
