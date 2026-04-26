import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">

      <!-- ─── Mobile Top Bar ──────────────────────────────────────────────── -->
      <header class="mobile-topbar">
        <button class="hamburger" (click)="sidebarOpen = true" aria-label="Open menu">
          <span class="material-icons">menu</span>
        </button>
        <span class="mobile-logo">
          <span class="material-icons">label</span>
          Label<strong>Print</strong>
        </span>
      </header>

      <!-- ─── Sidebar Backdrop (mobile) ──────────────────────────────────── -->
      <div class="sidebar-backdrop" [class.open]="sidebarOpen" (click)="sidebarOpen = false"></div>

      <!-- ─── Sidebar Navigation ─────────────────────────────────────────── -->
      <nav class="sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-logo">
          <span class="material-icons">label</span>
          <span class="logo-text">Label<strong>Print</strong></span>
          <!-- Close button visible only on mobile -->
          <button class="sidebar-close" (click)="sidebarOpen = false" aria-label="Close menu">
            <span class="material-icons">close</span>
          </button>
        </div>

        <ul class="nav-links">
          <li>
            <a routerLink="/orders" routerLinkActive="active" (click)="sidebarOpen = false">
              <span class="material-icons">receipt_long</span>
              Orders
            </a>
          </li>
          <li>
            <a routerLink="/customers" routerLinkActive="active" (click)="sidebarOpen = false">
              <span class="material-icons">people</span>
              Customers
            </a>
          </li>
          <li>
            <a routerLink="/products" routerLinkActive="active" (click)="sidebarOpen = false">
              <span class="material-icons">inventory_2</span>
              Products
            </a>
          </li>
          <li>
            <a routerLink="/labels" routerLinkActive="active" (click)="sidebarOpen = false">
              <span class="material-icons">dashboard_customize</span>
              Labels
            </a>
          </li>
          <li>
            <a routerLink="/master-data" routerLinkActive="active" (click)="sidebarOpen = false">
              <span class="material-icons">tune</span>
              Master Data
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <span class="material-icons">circle</span>
          <span>DB Active</span>
        </div>
      </nav>

      <!-- ─── Main Content ────────────────────────────────────────────────── -->
      <main class="page-content">
        <router-outlet />
      </main>

      <!-- ─── Mobile Bottom Navigation Bar ──────────────────────────────── -->
      <nav class="bottom-nav">
        <a routerLink="/orders" routerLinkActive="active">
          <span class="material-icons">receipt_long</span>
          <span>Orders</span>
        </a>
        <a routerLink="/customers" routerLinkActive="active">
          <span class="material-icons">people</span>
          <span>Customers</span>
        </a>
        <a routerLink="/products" routerLinkActive="active">
          <span class="material-icons">inventory_2</span>
          <span>Products</span>
        </a>
        <a routerLink="/labels" routerLinkActive="active">
          <span class="material-icons">dashboard_customize</span>
          <span>Labels</span>
        </a>
        <a routerLink="/master-data" routerLinkActive="active">
          <span class="material-icons">tune</span>
          <span>More</span>
        </a>
      </nav>

    </div>
  `,
  styles: [`
    /* ── Desktop Sidebar ──────────────────────────────────────────────────── */
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
      .logo-text { flex: 1; color: var(--text-secondary); strong { color: var(--text-primary); } }
    }

    .sidebar-close {
      display: none; /* shown only on mobile via media query */
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      .material-icons { font-size: 20px; }
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

    /* ── Mobile-only elements (hidden on desktop) ─────────────────────────── */
    .mobile-topbar { display: none; }
    .bottom-nav    { display: none; }
    .sidebar-backdrop { display: none; }

    /* ── Mobile Breakpoint ────────────────────────────────────────────────── */
    @media (max-width: 768px) {

      /* Top bar */
      .mobile-topbar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 16px;
        height: 52px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
        position: sticky;
        top: 0;
        z-index: 100;

        .hamburger {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          .material-icons { font-size: 22px; }
          &:hover { color: var(--text-primary); }
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-secondary);
          .material-icons { font-size: 20px; color: var(--accent); }
          strong { color: var(--text-primary); }
        }
      }

      /* Backdrop */
      .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 200;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;

        &.open {
          opacity: 1;
          pointer-events: auto;
        }
      }

      /* Sidebar: slides in from the left */
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100dvh;
        width: 260px;
        z-index: 300;
        transform: translateX(-100%);
        transition: transform 0.28s ease;
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);

        &.open {
          transform: translateX(0);
        }
      }

      .sidebar-close {
        display: flex;
        align-items: center;
        margin-left: auto;
      }

      /* Bottom navigation bar */
      .bottom-nav {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: var(--bg-secondary);
        border-top: 1px solid var(--border);
        z-index: 100;

        a {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 9px;
          font-weight: 500;
          transition: color var(--transition);

          .material-icons { font-size: 20px; }

          &.active {
            color: var(--accent);
          }

          &:hover:not(.active) {
            color: var(--text-secondary);
          }
        }
      }
    }
  `]
})
export class App {
  title = 'Label Print';
  sidebarOpen = false;
}

