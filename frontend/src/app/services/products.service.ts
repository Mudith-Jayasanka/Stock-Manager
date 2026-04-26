import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private base = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(sortBy?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (sortBy) params = params.set('sortBy', sortBy);
    return this.http.get<Product[]>(this.base, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'profit' | 'containerTypeName'>): Observable<Product> {
    return this.http.post<Product>(this.base, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, product);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
