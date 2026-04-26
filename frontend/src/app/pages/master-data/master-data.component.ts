import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterDataService } from '../../services/master-data.service';
import { ContainerType, Fragrance } from '../../models';

@Component({
  selector: 'app-master-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './master-data.component.html',
  styleUrl: './master-data.component.scss',
})
export class MasterDataComponent implements OnInit {
  activeTab: 'containers' | 'fragrances' = 'containers';

  containerTypes: ContainerType[] = [];
  fragrances: Fragrance[] = [];

  newContainerName = '';
  newFragranceName = '';

  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(private masterDataService: MasterDataService) {}

  ngOnInit() {
    this.loadContainerTypes();
    this.loadFragrances();
  }

  loadContainerTypes() {
    this.masterDataService.getContainerTypes().subscribe(data => (this.containerTypes = data));
  }

  loadFragrances() {
    this.masterDataService.getFragrances().subscribe(data => (this.fragrances = data));
  }

  addContainerType() {
    if (!this.newContainerName.trim()) return;
    this.masterDataService.addContainerType(this.newContainerName.trim()).subscribe({
      next: () => {
        this.newContainerName = '';
        this.loadContainerTypes();
        this.showToast('Container type added.', 'success');
      },
      error: () => this.showToast('Failed to add container type.', 'error'),
    });
  }

  deleteContainerType(id: string) {
    this.masterDataService.deleteContainerType(id).subscribe({
      next: (res) => {
        this.loadContainerTypes();
        this.showToast(res.archived ? 'Item archived (in use by products).' : 'Item deleted.', 'success');
      },
      error: () => this.showToast('Failed to delete.', 'error'),
    });
  }

  addFragrance() {
    if (!this.newFragranceName.trim()) return;
    this.masterDataService.addFragrance(this.newFragranceName.trim()).subscribe({
      next: () => {
        this.newFragranceName = '';
        this.loadFragrances();
        this.showToast('Fragrance added.', 'success');
      },
      error: () => this.showToast('Failed to add fragrance.', 'error'),
    });
  }

  deleteFragrance(id: string) {
    this.masterDataService.deleteFragrance(id).subscribe({
      next: (res) => {
        this.loadFragrances();
        this.showToast(res.archived ? 'Item archived (in use by products).' : 'Item deleted.', 'success');
      },
      error: () => this.showToast('Failed to delete.', 'error'),
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3000);
  }
}
