import { Injectable } from '@angular/core';
import * as fabric from 'fabric';
// @ts-ignore
import bwipjs from 'bwip-js';
import { Order, LabelTemplate, CanvasElement } from '../models';

@Injectable({ providedIn: 'root' })
export class PrintService {
  private PIXELS_PER_MM = 5;

  constructor() {}

  async printLabels(orders: Order[], template: LabelTemplate) {
    const images: string[] = [];

    // For each order, generate the label image
    for (const order of orders) {
      const dataUri = await this.generateLabelImage(order, template);
      images.push(dataUri);
    }

    this.triggerPrint(images, template.widthMm, template.heightMm);
  }

  private async generateLabelImage(order: Order, template: LabelTemplate): Promise<string> {
    return new Promise((resolve) => {
      // Create off-screen canvas
      const canvasEl = document.createElement('canvas');
      const canvas = new fabric.Canvas(canvasEl, {
        width: template.widthMm * this.PIXELS_PER_MM,
        height: template.heightMm * this.PIXELS_PER_MM,
        backgroundColor: '#ffffff'
      });

      // We need to parse variables
      const elements = JSON.parse(JSON.stringify(template.elements)); // deep clone
      
      const fabricObjects = elements.map((el: CanvasElement) => {
        let config = el.config;
        if (!config) {
            // fallback
            config = {
              type: el.type.includes('variable') ? 'i-text' : (el.type === 'text' ? 'i-text' : 'rect'),
              left: el.x,
              top: el.y,
              text: el.content || '',
              fontSize: el.fontSize || 14,
              fontFamily: el.fontFamily || 'Arial',
              customType: el.type.includes('variable') ? 'variable' : undefined,
              mappedField: el.mappedField,
              fill: '#000000'
            };
        }

        // Text Variables
        if (config.customType === 'variable' || config.type === 'i-text' || config.type === 'text') {
            const mappedField = config.mappedField;
            if (mappedField) {
               const value = this.resolveVariable(mappedField, order);
               config.text = value || ' '; // fallback to empty space
            }
            config.fill = '#000000';
        }

        // Barcode / QR Variables
        if (el.type === 'variable-barcode' || el.type === 'variable-qr') {
            const mappedField = el.mappedField;
            const value = mappedField ? this.resolveVariable(mappedField, order) : '123456';
            
            const tempCanvas = document.createElement('canvas');
            try {
              bwipjs.toCanvas(tempCanvas, {
                bcid: el.type === 'variable-barcode' ? 'code128' : 'qrcode',
                text: value || 'N/A',
                scale: 3,
                height: 10,
                includetext: el.type === 'variable-barcode',
                textxalign: 'center',
              });
              const imgData = tempCanvas.toDataURL('image/png');
              
              config = {
                type: 'image',
                left: el.x,
                top: el.y,
                src: imgData,
              };
            } catch (e) {
              console.error('Barcode generation failed', e);
            }
        }

        return config;
      });

      const json = {
        version: '7.3.1',
        objects: fabricObjects
      };

      canvas.loadFromJSON(json).then(() => {
        canvas.renderAll();
        // Extract to base64 image
        const dataUrl = canvas.toDataURL({
          format: 'png',
          multiplier: 2 // Higher quality for print
        });
        canvas.dispose();
        resolve(dataUrl);
      });
    });
  }

  private resolveVariable(field: string, order: Order): string {
    // Basic dot notation resolver (e.g. "order.customer.fullName")
    const parts = field.split('.');
    let current: any = { order };
    
    // For product-related variables in an order context, 
    // we might just take the first item's product for now, or sum them.
    // E.g. "product.name" -> order.items[0].product.name
    if (parts[0] === 'product') {
        if (order.items && order.items.length > 0) {
            current = { product: order.items[0].product };
        } else {
            return '';
        }
    }

    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        return '';
      }
    }
    return String(current);
  }

  private triggerPrint(images: string[], widthMm: number, heightMm: number) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print labels.');
      return;
    }

    let html = `
      <html>
        <head>
          <title>Print Labels</title>
          <style>
            @page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }
            body { margin: 0; padding: 0; background: #fff; }
            .page { 
              width: ${widthMm}mm; 
              height: ${heightMm}mm; 
              display: flex;
              justify-content: center;
              align-items: center;
              page-break-after: always;
              overflow: hidden;
            }
            .page:last-child { page-break-after: auto; }
            img { width: 100%; height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
    `;

    for (const img of images) {
      html += `<div class="page"><img src="${img}" /></div>`;
    }

    html += `
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }
}
