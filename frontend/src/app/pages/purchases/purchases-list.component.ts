import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchasesService } from '../../services/purchases.service';
import { MasterDataService } from '../../services/master-data.service';
import { MaterialPurchase, MaterialType, MaterialUnit, ContainerType, Fragrance, WaxType } from '../../models';

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchases-list.component.html',
  styleUrls: ['./purchases-list.component.scss']
})
export class PurchasesListComponent implements OnInit {
  purchases: MaterialPurchase[] = [];
  loading = true;
  errorMsg = '';
  showModal = false;

  // Master Data Options for dropdown
  waxTypes: WaxType[] = [];
  fragrances: Fragrance[] = [];
  containerTypes: ContainerType[] = [];

  // Form State
  formMaterialType: MaterialType = 'wax';
  formMaterialId = '';
  formQuantity: number | null = null;
  formUnit: MaterialUnit = 'g';
  formTotalCost: number | null = null;
  formSupplier = '';
  formNotes = '';
  submitting = false;

  constructor(
    private purchasesService: PurchasesService,
    private masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMsg = '';

    this.purchasesService.getPurchases().subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load purchase history.';
        this.loading = false;
      }
    });

    this.masterDataService.getWaxTypes().subscribe(data => this.waxTypes = data);
    this.masterDataService.getFragrances().subscribe(data => this.fragrances = data);
    this.masterDataService.getContainerTypes().subscribe(data => this.containerTypes = data);
  }

  openModal(): void {
    this.formMaterialType = 'wax';
    this.formMaterialId = '';
    this.formQuantity = null;
    this.formUnit = 'kg';
    this.formTotalCost = null;
    this.formSupplier = '';
    this.formNotes = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onTypeChange(): void {
    this.formMaterialId = '';
    if (this.formMaterialType === 'wax') {
      this.formUnit = 'kg';
    } else if (this.formMaterialType === 'fragrance') {
      this.formUnit = 'ml';
    } else if (this.formMaterialType === 'container') {
      this.formUnit = 'units';
    }
  }

  get availableMaterials(): { id: string; name: string }[] {
    if (this.formMaterialType === 'wax') return this.waxTypes;
    if (this.formMaterialType === 'fragrance') return this.fragrances;
    if (this.formMaterialType === 'container') return this.containerTypes;
    return [];
  }

  get calculatedBaseUnitCost(): number {
    if (!this.formQuantity || !this.formTotalCost || this.formQuantity <= 0 || this.formTotalCost <= 0) {
      return 0;
    }
    const mult = (this.formUnit === 'kg' || this.formUnit === 'L') ? 1000 : 1;
    const baseQty = this.formQuantity * mult;
    return this.formTotalCost / baseQty;
  }

  get baseUnitLabel(): string {
    if (this.formMaterialType === 'container') return '/ unit';
    if (this.formUnit === 'ml' || this.formUnit === 'L') return '/ ml';
    return '/ g';
  }

  submitPurchase(): void {
    if (!this.formMaterialId || !this.formQuantity || !this.formTotalCost) {
      alert('Please fill in all required fields.');
      return;
    }

    this.submitting = true;
    this.purchasesService.addPurchase({
      materialType: this.formMaterialType,
      materialId: this.formMaterialId,
      quantity: this.formQuantity,
      unit: this.formUnit,
      totalCost: this.formTotalCost,
      supplier: this.formSupplier,
      notes: this.formNotes
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        this.submitting = false;
        alert(err.error?.error || 'Failed to record purchase.');
      }
    });
  }

  deletePurchase(purchase: MaterialPurchase): void {
    if (confirm(`Delete purchase record for ${purchase.materialName}?`)) {
      this.purchasesService.deletePurchase(purchase.id).subscribe({
        next: () => {
          this.loadData();
        },
        error: () => {
          alert('Failed to delete purchase.');
        }
      });
    }
  }

  get totalSpent(): number {
    return this.purchases.reduce((sum, p) => sum + p.totalCost, 0);
  }
}

