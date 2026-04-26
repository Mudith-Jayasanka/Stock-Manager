import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../services/products.service';
import { MasterDataService } from '../../../services/master-data.service';
import { ContainerType, Fragrance, FragranceComposition } from '../../../models';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss',
})
export class ProductCreateComponent implements OnInit {
  Math = Math; // Expose Math to template

  // Form Fields
  name = '';
  price: number | null = null;
  cost: number | null = null;
  weightGrams: number | null = null;
  selectedContainerTypeId = '';

  // Master Data
  containerTypes: ContainerType[] = [];
  availableFragrances: Fragrance[] = [];

  // Fragrance Composition
  fragranceComposition: (FragranceComposition & { name: string })[] = [];
  selectedFragranceId = '';

  // UI State
  saving = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private productsService: ProductsService,
    private masterDataService: MasterDataService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.masterDataService.getContainerTypes().subscribe(
      data => (this.containerTypes = data.filter(c => c.isActive))
    );
    this.masterDataService.getFragrances().subscribe(
      data => (this.availableFragrances = data.filter(f => f.isActive))
    );
  }

  get unusedFragrances(): Fragrance[] {
    const usedIds = new Set(this.fragranceComposition.map(f => f.fragranceId));
    return this.availableFragrances.filter(f => !usedIds.has(f.id));
  }

  get totalPercentage(): number {
    return this.fragranceComposition.reduce((sum, f) => sum + (f.percentage || 0), 0);
  }

  get percentageValid(): boolean { return Math.round(this.totalPercentage) === 100; }

  addFragrance() {
    if (!this.selectedFragranceId) return;
    const fragrance = this.availableFragrances.find(f => f.id === this.selectedFragranceId);
    if (!fragrance) return;
    this.fragranceComposition.push({ fragranceId: fragrance.id, percentage: 0, name: fragrance.name });
    this.selectedFragranceId = '';
  }

  removeFragrance(index: number) {
    this.fragranceComposition.splice(index, 1);
  }

  get isFormValid(): boolean {
    return !!(
      this.name.trim() &&
      this.price !== null && this.price > 0 &&
      this.cost !== null && this.cost > 0 &&
      this.weightGrams !== null && this.weightGrams > 0 &&
      this.selectedContainerTypeId &&
      this.fragranceComposition.length > 0 &&
      this.percentageValid
    );
  }

  save() {
    if (!this.isFormValid || this.saving) return;
    this.saving = true;

    this.productsService.createProduct({
      name: this.name.trim(),
      price: this.price!,
      cost: this.cost!,
      weightGrams: this.weightGrams!,
      containerTypeId: this.selectedContainerTypeId,
      fragrances: this.fragranceComposition.map(f => ({
        fragranceId: f.fragranceId,
        percentage: f.percentage,
      })),
    }).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.error || 'Failed to create product.';
        this.showToast(msg, 'error');
      },
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 4000);
  }
}
