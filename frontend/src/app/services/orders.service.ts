import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private base = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(status?: OrderStatus): Observable<Order[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Order[]>(this.base, { params });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  createOrder(payload: {
    customer: Omit<import('../models').Customer, 'id' | 'createdAt'>;
    items: { productId: string; quantity: number }[];
  }): Observable<Order> {
    return this.http.post<Order>(this.base, payload);
  }

  updateStatus(id: string, status: OrderStatus, cancelReason?: string): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/${id}/status`, { status, cancelReason });
  }
}
