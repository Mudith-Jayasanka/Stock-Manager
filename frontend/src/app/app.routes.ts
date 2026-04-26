import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders-list/orders-list.component').then(m => m.OrdersListComponent),
  },
  {
    path: 'orders/create',
    loadComponent: () => import('./pages/orders/order-create/order-create.component').then(m => m.OrderCreateComponent),
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./pages/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products-list/products-list.component').then(m => m.ProductsListComponent),
  },
  {
    path: 'products/create',
    loadComponent: () => import('./pages/products/product-create/product-create.component').then(m => m.ProductCreateComponent),
  },
  {
    path: 'master-data',
    loadComponent: () => import('./pages/master-data/master-data.component').then(m => m.MasterDataComponent),
  },
  {
    path: 'labels',
    loadComponent: () => import('./pages/labels/label-list/label-list.component').then(m => m.LabelListComponent),
  },
  {
    path: 'labels/create',
    loadComponent: () => import('./pages/labels/label-editor/label-editor.component').then(m => m.LabelEditorComponent),
  },
  {
    path: 'labels/:id/edit',
    loadComponent: () => import('./pages/labels/label-editor/label-editor.component').then(m => m.LabelEditorComponent),
  },
  { path: '**', redirectTo: 'orders' },
];
