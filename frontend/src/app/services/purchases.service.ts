import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaterialPurchase, MaterialType, MaterialUnit } from '../models';

@Injectable({ providedIn: 'root' })
export class PurchasesService {
  private base = 'http://localhost:3000/api/purchases';

  constructor(private http: HttpClient) {}

  getPurchases(): Observable<MaterialPurchase[]> {
    return this.http.get<MaterialPurchase[]>(this.base);
  }

  addPurchase(purchase: {
    materialType: MaterialType;
    materialId: string;
    quantity: number;
    unit: MaterialUnit;
    totalCost: number;
    supplier?: string;
    notes?: string;
  }): Observable<MaterialPurchase> {
    return this.http.post<MaterialPurchase>(this.base, purchase);
  }

  deletePurchase(id: string): Observable<{ message: string; updatedMaterialUnitCost: number }> {
    return this.http.delete<{ message: string; updatedMaterialUnitCost: number }>(`${this.base}/${id}`);
  }
}

