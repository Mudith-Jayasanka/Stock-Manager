import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, NgZone } from '@angular/core';
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
  @ViewChild('canvasContainer') canvasContainerEl!: ElementRef<HTMLDivElement>;
  
  canvas!: fabric.Canvas;
  
  // Template settings
  templateId: string | null = null;
  name = 'New Template';
  widthMm = 50;
  heightMm = 30;

  // Editor State
  private PIXELS_PER_MM = 5; // Internal logical resolution (matches print service)
  private resizeObserver?: ResizeObserver;
  /** Distance in canvas pixels within which a snap activates */
  private readonly SNAP_THRESHOLD = 8;
  /** Accumulated offset when an object is magnetically snapped */
  private activeSnapDX = 0;
  private activeSnapDY = 0;
  /** Active guide lines drawn during a drag operation */
  private snapLines: fabric.Line[] = [];
  /** Bound reference kept so the same function instance can be removed in ngOnDestroy */
  private readonly boundKeyDown = (e: KeyboardEvent) => this.onKeyDown(e);
  activeObject: fabric.Object | null = null;
  saving = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  // Mapping Configuration
  availableVariables = MAPPING_FIELDS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templatesService: LabelTemplatesService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.templateId = this.route.snapshot.paramMap.get('id');
  }

  ngAfterViewInit() {
    this.initCanvas();

    // Watch the container for resize events and refit the canvas
    this.resizeObserver = new ResizeObserver(() => {
      this.ngZone.run(() => this.updateCanvasSize());
    });
    this.resizeObserver.observe(this.canvasContainerEl.nativeElement);

    if (this.templateId && this.templateId !== 'create') {
      this.loadTemplate(this.templateId);
    } else {
      this.updateCanvasSize();
    }

    // Global keyboard shortcut listener (Ctrl/Cmd+D = duplicate)
    document.addEventListener('keydown', this.boundKeyDown);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.boundKeyDown);
    this.resizeObserver?.disconnect();
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

    this.initSnapping();
  }

  updateCanvasSize() {
    if (!this.canvas || !this.canvasContainerEl) return;

    // Measure the available space inside the container (subtract padding)
    const container = this.canvasContainerEl.nativeElement;
    const padding = 32; // px breathing room on each axis
    const availW = Math.max(container.clientWidth  - padding * 2, 80);
    const availH = Math.max(container.clientHeight - padding * 2 - 40, 80); // -40 for ruler

    // Compute the visual scale that fits the label (mm) into the available px area
    const scaleW = availW / this.widthMm;
    const scaleH = availH / this.heightMm;
    const visualScale = Math.min(scaleW, scaleH);

    // We set the physical dimensions for sharp rendering
    this.canvas.setDimensions({
      width:  Math.round(this.widthMm  * visualScale),
      height: Math.round(this.heightMm * visualScale)
    });

    // Set zoom so that logical coordinates remain based on PIXELS_PER_MM
    const zoom = visualScale / this.PIXELS_PER_MM;
    this.canvas.setZoom(zoom);

    // Always keep a white background
    this.canvas.backgroundColor = '#ffffff';
    this.canvas.renderAll();
  }

  // ─── Tools ────────────────────────────────────────────────────────────

  addText() {
    const text = new fabric.IText('Double click to edit', {
      left: 10,
      top: 20,
      originX: 'left',
      originY: 'center',
      textAlign: 'left',
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
      top: 20,
      originX: 'left',
      originY: 'center',
      textAlign: 'left',
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

  /** Ctrl/Cmd+D — duplicates the active object with a 10px offset */
  async duplicateSelected() {
    if (!this.activeObject) return;

    // Don't duplicate while the user is editing text in-place
    if ((this.activeObject as any).isEditing) return;

    const cloned = await this.activeObject.clone(['customType', 'mappedField']);
    cloned.set({
      left: (this.activeObject.left ?? 0) + 10,
      top:  (this.activeObject.top  ?? 0) + 10,
    });
    this.canvas.add(cloned);
    this.canvas.setActiveObject(cloned);
    this.canvas.renderAll();
  }

  /** Global keydown handler — only acts when focus is NOT in a form field */
  private onKeyDown(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement).tagName;
    const isFormField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      || (e.target as HTMLElement).isContentEditable;
    if (isFormField) return;

    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault(); // prevent browser's built-in bookmark shortcut
      this.ngZone.run(() => this.duplicateSelected());
    }
  }

  // ─── Snapping ─────────────────────────────────────────────────────────

  private initSnapping() {
    this.canvas.on('object:moving', (e: any) => this.handleSnapping(e));
    this.canvas.on('object:modified',  () => { this.clearSnapLines(); this.resetSnapDelta(); });
    this.canvas.on('mouse:up',         () => { this.clearSnapLines(); this.resetSnapDelta(); });
  }

  private resetSnapDelta() {
    this.activeSnapDX = 0;
    this.activeSnapDY = 0;
  }

  private clearSnapLines() {
    this.snapLines.forEach(l => this.canvas.remove(l));
    this.snapLines = [];
    this.canvas.requestRenderAll();
  }

  /** Draw one guide line across the full canvas */
  private addSnapLine(x1: number, y1: number, x2: number, y2: number) {
    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: '#9d8fff',       // accent-light — visible on both dark and white surfaces
      strokeWidth: 1,
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      opacity: 0.9,
    } as any);
    (line as any)._isSnapLine = true;
    this.canvas.add(line);
    this.canvas.bringObjectToFront(line);
    this.snapLines.push(line);
  }

  /**
   * Called on every object:moving tick.
   * Checks the 3 key X-points (left / centre / right) and 3 key Y-points
   * (top / centre / bottom) of the dragged object against:
   *   • the canvas left, centre, and right edges
   *   • the canvas top, centre, and bottom edges
   *   • the equivalent 3 points of every other object already on the canvas
   * When a match within SNAP_THRESHOLD is found the object is nudged to
   * perfect alignment and a coloured guide line is drawn.
   */
  private handleSnapping(e: any) {
    this.clearSnapLines();

    const obj = e.target as fabric.Object;
    
    // 1. Recover the true "unsnapped" intention of the mouse drag
    // Since obj.left contains the dx from the mouse added to the previous frame's SNAPPED position,
    // we subtract the previous snap delta to find where the mouse actually wants the object to be.
    const unsnappedLeft = (obj.left ?? 0) - this.activeSnapDX;
    const unsnappedTop  = (obj.top  ?? 0) - this.activeSnapDY;

    // Temporarily apply unsnapped coords to get accurate bounding rect
    obj.set({ left: unsnappedLeft, top: unsnappedTop });
    obj.setCoords();

    const W = this.widthMm * this.PIXELS_PER_MM; // Logical width
    const H = this.heightMm * this.PIXELS_PER_MM; // Logical height
    const T = this.SNAP_THRESHOLD / this.canvas.getZoom(); // Adjust snap threshold by zoom

    // Absolute bounding box of the object being dragged (at unsnapped position)
    const br = obj.getBoundingRect();
    const objLeft   = br.left;
    const objCX     = br.left + br.width  / 2;
    const objRight  = br.left + br.width;
    const objTop    = br.top;
    const objCY     = br.top  + br.height / 2;
    const objBottom = br.top  + br.height;

    // Build snap-target pools: canvas boundaries/midpoints + other objects
    const xTargets: number[] = [0, W / 2, W];
    const yTargets: number[] = [0, H / 2, H];

    this.canvas.getObjects().forEach(other => {
      if (other === obj || (other as any)._isSnapLine) return;
      const o = other.getBoundingRect();
      xTargets.push(o.left, o.left + o.width / 2, o.left + o.width);
      yTargets.push(o.top,  o.top  + o.height / 2, o.top  + o.height);
    });

    let snapDX = 0;
    let snapDY = 0;

    // ── Horizontal alignment (vertical guide line) ────────────────────────
    outerX: for (const objX of [objLeft, objCX, objRight]) {
      for (const tx of xTargets) {
        if (Math.abs(objX - tx) <= T) {
          snapDX = tx - objX;
          this.addSnapLine(tx, 0, tx, H);
          break outerX;
        }
      }
    }

    // ── Vertical alignment (horizontal guide line) ────────────────────────
    outerY: for (const objY of [objTop, objCY, objBottom]) {
      for (const ty of yTargets) {
        if (Math.abs(objY - ty) <= T) {
          snapDY = ty - objY;
          this.addSnapLine(0, ty, W, ty);
          break outerY;
        }
      }
    }

    this.activeSnapDX = snapDX;
    this.activeSnapDY = snapDY;

    // 2. Apply the new snap delta
    obj.set({
      left: unsnappedLeft + snapDX,
      top:  unsnappedTop  + snapDY,
    });
    obj.setCoords();
    
    // Always render to ensure smooth following when broken out of snap
    this.canvas.requestRenderAll();
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
    // Ensure snap guide lines are not serialised with the template
    this.clearSnapLines();

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
          // Explicitly restore white background — loadFromJSON can overwrite it
          this.canvas.backgroundColor = '#ffffff';
          this.updateCanvasSize();
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
