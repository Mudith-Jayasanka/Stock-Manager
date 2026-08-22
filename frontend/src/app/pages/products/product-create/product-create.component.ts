import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductsService } from '../../../services/products.service';
import { MasterDataService } from '../../../services/master-data.service';
import { ContainerType, Fragrance, FragranceComposition, WaxType, WaxComposition, Product } from '../../../models';

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
  productId: string | null = null;
  name = '';
  price: number | null = null;
  cost: number | null = null;
  weightGrams: number | null = null;
  selectedContainerTypeId = '';
  fragranceLoad: number = 0;

  // Master Data
  containerTypes: ContainerType[] = [];
  availableFragrances: Fragrance[] = [];
  availableWaxes: WaxType[] = [];

  // Fragrance Composition
  fragranceComposition: (FragranceComposition & { name: string })[] = [];
  selectedFragranceId = '';

  // Wax Composition
  waxComposition: (WaxComposition & { name: string })[] = [];
  selectedWaxId = '';

  // UI State
  loading = false;
  saving = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private productsService: ProductsService,
    private masterDataService: MasterDataService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  get isEdit(): boolean { return !!this.productId; }

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    const masterData$ = forkJoin({
      containers: this.masterDataService.getContainerTypes(),
      fragrances: this.masterDataService.getFragrances(),
      waxes: this.masterDataService.getWaxTypes()
    });

    masterData$.subscribe({
      next: (data) => {
        this.containerTypes = data.containers;
        this.availableFragrances = data.fragrances;
        this.availableWaxes = data.waxes;

        if (this.productId) {
          this.loadProduct(this.productId);
        } else {
          // If creating, only show active items
          this.containerTypes = this.containerTypes.filter(c => c.isActive);
          this.availableFragrances = this.availableFragrances.filter(f => f.isActive);
          this.availableWaxes = this.availableWaxes.filter(w => w.isActive);
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        this.showToast('Failed to load master data.', 'error');
      }
    });
  }

  loadProduct(id: string) {
    this.productsService.getProduct(id).subscribe({
      next: (p: Product) => {
        this.name = p.name;
        this.price = p.price;
        this.cost = p.cost;
        this.weightGrams = p.weightGrams;
        this.selectedContainerTypeId = p.containerTypeId;
        this.fragranceLoad = p.fragranceLoad;
        
        this.fragranceComposition = p.fragrances.map(f => ({
          fragranceId: f.fragranceId,
          percentage: f.percentage,
          name: f.fragranceName || this.availableFragrances.find(af => af.id === f.fragranceId)?.name || 'Unknown'
        }));

        this.waxComposition = p.waxes.map(w => ({
          waxTypeId: w.waxTypeId,
          percentage: w.percentage,
          name: w.waxTypeName || this.availableWaxes.find(aw => aw.id === w.waxTypeId)?.name || 'Unknown'
        }));

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Product not found.', 'error');
        this.router.navigate(['/products']);
      }
    });
  }

  // ── Fragrance Logic ───────────────────────────────────────────────────────
  get unusedFragrances(): Fragrance[] {
    const usedIds = new Set(this.fragranceComposition.map(f => f.fragranceId));
    return this.availableFragrances.filter(f => f.isActive && !usedIds.has(f.id));
  }

  get totalFragrancePercentage(): number {
    return this.fragranceComposition.reduce((sum, f) => sum + (f.percentage || 0), 0);
  }

  get fragrancePercentageValid(): boolean { return Math.round(this.totalFragrancePercentage) === 100; }

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

  // ── Wax Logic ─────────────────────────────────────────────────────────────
  get unusedWaxes(): WaxType[] {
    const usedIds = new Set(this.waxComposition.map(w => w.waxTypeId));
    return this.availableWaxes.filter(w => w.isActive && !usedIds.has(w.id));
  }

  get totalWaxPercentage(): number {
    return this.waxComposition.reduce((sum, w) => sum + (w.percentage || 0), 0);
  }

  get waxPercentageValid(): boolean { return Math.round(this.totalWaxPercentage) === 100; }

  addWax() {
    if (!this.selectedWaxId) return;
    const wax = this.availableWaxes.find(w => w.id === this.selectedWaxId);
    if (!wax) return;
    this.waxComposition.push({ waxTypeId: wax.id, percentage: 0, name: wax.name });
    this.selectedWaxId = '';
  }

  removeWax(index: number) {
    this.waxComposition.splice(index, 1);
  }

  // ── Weight Calculations ───────────────────────────────────────────────────
  get waxWeight(): number {
    if (!this.weightGrams || !this.fragranceLoad) return this.weightGrams || 0;
    return this.weightGrams / (1 + this.fragranceLoad / 100);
  }

  get fragranceWeight(): number {
    if (!this.weightGrams) return 0;
    return this.weightGrams - this.waxWeight;
  }

  // ── Live BOM Cost Calculation Preview ──────────────────────────────────────
  get estimatedContainerCost(): number {
    if (!this.selectedContainerTypeId) return 0;
    const c = this.containerTypes.find(ct => ct.id === this.selectedContainerTypeId);
    return c?.unitCost ?? 0;
  }

  get estimatedWaxCost(): number {
    if (!this.weightGrams || this.waxComposition.length === 0) return 0;
    const wWeight = this.waxWeight;
    const weightedUnitCost = this.waxComposition.reduce((sum, w) => {
      const masterWax = this.availableWaxes.find(aw => aw.id === w.waxTypeId);
      const unitCost = masterWax?.unitCost ?? 0;
      return sum + ((w.percentage / 100) * unitCost);
    }, 0);
    return wWeight * weightedUnitCost;
  }

  get estimatedFragranceCost(): number {
    if (!this.weightGrams || this.fragranceComposition.length === 0) return 0;
    const fWeight = this.fragranceWeight;
    const weightedUnitCost = this.fragranceComposition.reduce((sum, f) => {
      const masterFrag = this.availableFragrances.find(af => af.id === f.fragranceId);
      const unitCost = masterFrag?.unitCost ?? 0;
      return sum + ((f.percentage / 100) * unitCost);
    }, 0);
    return fWeight * weightedUnitCost;
  }

  get estimatedBomCost(): number {
    const total = this.estimatedWaxCost + this.estimatedFragranceCost + this.estimatedContainerCost;
    return total > 0 ? Math.round(total * 100) / 100 : 0;
  }

  get effectiveCost(): number {
    return this.estimatedBomCost > 0 ? this.estimatedBomCost : (this.cost || 0);
  }

  get estimatedProfit(): number {
    if (!this.price) return 0;
    return this.price - this.effectiveCost;
  }

  get estimatedMarginPercent(): number {
    if (!this.price || this.price <= 0) return 0;
    return Math.round((this.estimatedProfit / this.price) * 1000) / 10;
  }

  // ── Form Actions ──────────────────────────────────────────────────────────
  get isFormValid(): boolean {
    return !!(
      this.name.trim() &&
      this.price !== null && this.price > 0 &&
      this.weightGrams !== null && this.weightGrams > 0 &&
      this.selectedContainerTypeId &&
      this.fragranceComposition.length > 0 &&
      this.fragrancePercentageValid &&
      this.waxComposition.length > 0 &&
      this.waxPercentageValid
    );
  }

  save() {
    if (!this.isFormValid || this.saving) return;
    this.saving = true;

    const payload = {
      name: this.name.trim(),
      price: this.price!,
      cost: this.cost ?? (this.estimatedBomCost > 0 ? Math.round(this.estimatedBomCost) : 0),
      weightGrams: this.weightGrams!,
      containerTypeId: this.selectedContainerTypeId,
      fragranceLoad: this.fragranceLoad,
      fragrances: this.fragranceComposition.map(f => ({
        fragranceId: f.fragranceId,
        percentage: f.percentage,
      })),
      waxes: this.waxComposition.map(w => ({
        waxTypeId: w.waxTypeId,
        percentage: w.percentage,
      })),
    };

    const request = this.isEdit 
      ? this.productsService.updateProduct(this.productId!, payload)
      : this.productsService.createProduct(payload);

    request.subscribe({
      next: () => {
        this.showToast(this.isEdit ? 'Product updated.' : 'Product created.', 'success');
        setTimeout(() => this.router.navigate(['/products']), 1000);
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.error || 'Failed to save product.';
        this.showToast(msg, 'error');
      },
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 4000);
  }
}
