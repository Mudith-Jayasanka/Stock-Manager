import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private base = 'http://localhost:3000/api/customers';

  constructor(private http: HttpClient) {}

  searchCustomers(q: string): Observable<Customer[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<Customer[]>(`${this.base}/search`, { params });
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.base);
  }

  getCustomer(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.base}/${id}`);
  }
}
