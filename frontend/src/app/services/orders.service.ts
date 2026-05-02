import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order, OrderStatus } from '../models';

export type OrderListFilter = OrderStatus | 'ongoing';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private base = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(status?: OrderListFilter): Observable<Order[]> {
    if (status === 'ongoing') {
      return this.http.get<Order[]>(this.base).pipe(
        map(orders => orders.filter(order => order.status !== 'cancelled'))
      );
    }

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
