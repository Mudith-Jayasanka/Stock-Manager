import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LabelTemplate } from '../models';

@Injectable({ providedIn: 'root' })
export class LabelTemplatesService {
  private base = 'http://localhost:3000/api/label-templates';

  constructor(private http: HttpClient) {}

  getTemplates(): Observable<LabelTemplate[]> {
    return this.http.get<LabelTemplate[]>(this.base);
  }

  getTemplate(id: string): Observable<LabelTemplate> {
    return this.http.get<LabelTemplate>(`${this.base}/${id}`);
  }

  createTemplate(template: Omit<LabelTemplate, 'id' | 'createdAt'>): Observable<LabelTemplate> {
    return this.http.post<LabelTemplate>(this.base, template);
  }

  saveTemplate(id: string, template: Partial<LabelTemplate>): Observable<LabelTemplate> {
    return this.http.put<LabelTemplate>(`${this.base}/${id}`, template);
  }

  deleteTemplate(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
