import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import * as fabric from 'fabric';
import { LabelTemplatesService } from '../../../services/label-templates.service';
import { LabelTemplate, CanvasElement, MAPPING_FIELDS } from '../../../models';

@Component({
  selector: 'app-label-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './label-editor.component.html',
  styleUrl: './label-editor.component.scss',
})
export class LabelEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;
  
  canvas!: fabric.Canvas;
  
  // Template settings
  templateId: string | null = null;
  name = 'New Template';
  widthMm = 50;
  heightMm = 30;

  // Editor State
  PIXELS_PER_MM = 5; // Internal rendering scale
  activeObject: fabric.Object | null = null;
  saving = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  // Mapping Configuration
  availableVariables = MAPPING_FIELDS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templatesService: LabelTemplatesService
  ) {}

  ngOnInit() {
    this.templateId = this.route.snapshot.paramMap.get('id');
  }

  ngAfterViewInit() {
    this.initCanvas();
    if (this.templateId && this.templateId !== 'create') {
      this.loadTemplate(this.templateId);
    } else {
      this.updateCanvasSize();
    }
  }

  ngOnDestroy() {
    if (this.canvas) {
      this.canvas.dispose();
    }
  }

  initCanvas() {
    this.canvas = new fabric.Canvas(this.canvasEl.nativeElement, {
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });

    this.canvas.on('selection:created', (e) => this.activeObject = e.selected?.[0] || null);
    this.canvas.on('selection:updated', (e) => this.activeObject = e.selected?.[0] || null);
    this.canvas.on('selection:cleared', () => this.activeObject = null);
  }

  updateCanvasSize() {
    if (!this.canvas) return;
    this.canvas.setDimensions({
      width: this.widthMm * this.PIXELS_PER_MM,
      height: this.heightMm * this.PIXELS_PER_MM
    });
    this.canvas.renderAll();
  }

  // ─── Tools ────────────────────────────────────────────────────────────

  addText() {
    const text = new fabric.IText('Double click to edit', {
      left: 10,
      top: 10,
      fontFamily: 'Arial',
      fontSize: 14,
      fill: '#000000',
    });
    this.canvas.add(text);
    this.canvas.setActiveObject(text);
  }

  addVariable() {
    const text = new fabric.IText('{{ VARIABLE }}', {
      left: 10,
      top: 10,
      fontFamily: 'Arial',
      fontSize: 14,
      fill: '#ff0000', // Variables are red in editor to distinguish
    });
    // Store custom data indicating this is a variable
    text.set('customType', 'variable');
    text.set('mappedField', '');
    
    this.canvas.add(text);
    this.canvas.setActiveObject(text);
  }

  addShape(type: 'rect' | 'circle') {
    let shape;
    if (type === 'rect') {
      shape = new fabric.Rect({
        left: 10, top: 10,
        width: 40, height: 40,
        fill: '#cccccc'
      });
    } else {
      shape = new fabric.Circle({
        left: 10, top: 10,
        radius: 20,
        fill: '#cccccc'
      });
    }
    this.canvas.add(shape);
    this.canvas.setActiveObject(shape);
  }

  deleteSelected() {
    if (this.activeObject) {
      this.canvas.remove(this.activeObject);
      this.activeObject = null;
    }
  }

  bringForward() {
    if (this.activeObject) {
      this.canvas.bringObjectForward(this.activeObject);
    }
  }

  sendBackwards() {
    if (this.activeObject) {
      this.canvas.sendObjectBackwards(this.activeObject);
    }
  }

  // ─── Object Properties ───────────────────────────────────────────────

  get isVariable(): boolean {
    return this.activeObject?.get('customType') === 'variable';
  }

  get isText(): boolean {
    return this.activeObject?.type === 'i-text' || this.activeObject?.type === 'text';
  }

  get fontSize(): number {
    if (this.isText && this.activeObject) {
      return (this.activeObject as fabric.IText).get('fontSize') || 14;
    }
    return 14;
  }

  set fontSize(val: number) {
    if (this.isText && this.activeObject && val > 0) {
      (this.activeObject as fabric.IText).set('fontSize', val);
      this.canvas.renderAll();
    }
  }

  get mappedField(): string {
    return this.activeObject?.get('mappedField') || '';
  }

  set mappedField(val: string) {
    if (this.activeObject) {
      this.activeObject.set('mappedField', val);
      const label = this.availableVariables.find((v: any) => v.value === val)?.label || 'VARIABLE';
      (this.activeObject as fabric.IText).set('text', `{{ ${label} }}`);
      this.canvas.renderAll();
    }
  }

  // ─── Save / Load ─────────────────────────────────────────────────────

  saveTemplate() {
    if (!this.name.trim() || this.saving) return;
    this.saving = true;

    // Serialize canvas
    const json: any = this.canvas.toObject(['customType', 'mappedField']);
    
    // We only store the basic representation here. 
    // In a full app, we would parse `json.objects` into `CanvasElement[]`.
    // For now, we store the full JSON string to recreate the canvas exactly.
    const elements: CanvasElement[] = json.objects.map((obj: any, idx: number) => ({
      id: `el-${idx}`,
      type: obj.customType === 'variable' ? 'variable-text' : (obj.type === 'i-text' ? 'text' : 'shape'),
      x: obj.left,
      y: obj.top,
      width: obj.width * obj.scaleX,
      height: obj.height * obj.scaleY,
      zIndex: idx,
      content: obj.text || '',
      mappedField: obj.mappedField,
      config: obj // Store entire fabric representation
    }));

    const payload: Omit<LabelTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      name: this.name.trim(),
      widthMm: this.widthMm,
      heightMm: this.heightMm,
      elements
    };

    const req = this.templateId && this.templateId !== 'create'
      ? this.templatesService.saveTemplate(this.templateId, payload)
      : this.templatesService.createTemplate(payload);

    req.subscribe({
      next: (res: LabelTemplate) => {
        this.templateId = res.id;
        this.saving = false;
        this.showToast('Template saved successfully', 'success');
        this.router.navigate(['/labels']);
      },
      error: () => {
        this.saving = false;
        this.showToast('Failed to save template', 'error');
      }
    });
  }

  loadTemplate(id: string) {
    this.templatesService.getTemplate(id).subscribe({
      next: (t) => {
        this.name = t.name;
        this.widthMm = t.widthMm;
        this.heightMm = t.heightMm;
        this.updateCanvasSize();
        
        // Reconstruct from fabric JSON structure
        const json = {
          version: '7.3.1',
          objects: t.elements.map(e => {
            if (e.config) return e.config;
            // Generate basic config for mock data
            return {
              type: 'i-text',
              left: e.x,
              top: e.y,
              text: e.content || (e.type.startsWith('variable') ? `{{ ${e.mappedField} }}` : 'Text'),
              fontSize: e.fontSize || 14,
              fontFamily: e.fontFamily || 'Arial',
              customType: e.type.startsWith('variable') ? 'variable' : undefined,
              mappedField: e.mappedField,
              fill: e.type.startsWith('variable') ? '#ff0000' : '#000000'
            };
          })
        };
        
        this.canvas.loadFromJSON(json).then(() => {
          this.canvas.renderAll();
        });
      },
      error: () => this.showToast('Failed to load template', 'error')
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3000);
  }
}
