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
            let textStr = config.text || '';
            
            if (config.customType === 'variable' && config.mappedField) {
                const value = this.resolveVariable(config.mappedField, order) || '';
                // If the user modified the text to include a placeholder, replace it cleanly
                if (textStr.includes('{{')) {
                    textStr = textStr.replace(/\{\{\s*.*?\s*\}\}/g, value);
                } else {
                    // Otherwise replace the entire string
                    textStr = value || ' ';
                }
            } else {
                // Standard text block inline interpolation: "Hello {{ order.customer.fullName }}"
                textStr = textStr.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match: string, field: string) => {
                    return this.resolveVariable(field, order) || '';
                });
            }

            config.text = textStr;
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
    
    // Format the date if the field is the order date
    if (field === 'order.createdAt' && current) {
      return String(current).substring(0, 10); // '2026-04-26'
    }
    
    // Append 'g' for product weight
    if (field === 'product.weightGrams' && current) {
      return String(current) + 'g';
    }

    return String(current);
  }

  private triggerPrint(images: string[], widthCm: number, heightCm: number) {
    const widthMm = widthCm * 10;
    const heightMm = heightCm * 10;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print labels.');
      return;
    }

    let html = `
      <html>
        <head>
          <title></title>
          <style>
            @page { 
              size: ${widthMm}mm ${heightMm}mm; 
              margin: 0 !important; 
            }
            html, body { 
              margin: 0 !important; 
              padding: 0 !important; 
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page { 
              width: ${widthMm}mm; 
              height: ${heightMm}mm; 
              page-break-after: always;
              page-break-inside: avoid;
              overflow: hidden;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .page:last-child { 
              page-break-after: auto; 
            }
            img { 
              width: ${widthMm}mm;
              height: ${heightMm}mm;
              display: block;
              object-fit: fill;
            }
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
            }, 300);
          };
        </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }
}
