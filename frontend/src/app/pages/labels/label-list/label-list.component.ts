import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LabelTemplatesService } from '../../../services/label-templates.service';
import { LabelTemplate } from '../../../models';

@Component({
  selector: 'app-label-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './label-list.component.html',
  styleUrl: './label-list.component.scss',
})
export class LabelListComponent implements OnInit {
  templates: LabelTemplate[] = [];
  loading = true;

  constructor(private templatesService: LabelTemplatesService) {}

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.loading = true;
    this.templatesService.getTemplates().subscribe({
      next: (data) => {
        this.templates = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  deleteTemplate(id: string) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    this.templatesService.deleteTemplate(id).subscribe(() => this.loadTemplates());
  }
}
