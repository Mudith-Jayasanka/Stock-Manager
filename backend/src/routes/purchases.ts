import { Router, Request, Response } from 'express';
import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { MaterialType, MaterialUnit } from '../types';

const router = Router();

function getMultiplier(unit: MaterialUnit): number {
  switch (unit) {
    case 'kg':
    case 'L':
      return 1000;
    case 'g':
    case 'ml':
    case 'units':
    default:
      return 1;
  }
}

function getMasterTable(materialType: MaterialType): string | null {
  if (materialType === 'wax') return 'wax_types';
  if (materialType === 'fragrance') return 'fragrances';
  if (materialType === 'container') return 'container_types';
  return null;
}

// ── Utility: Recalculate and update moving average unit cost for a material
async function recalculateMaterialUnitCost(materialType: MaterialType, materialId: string) {
  const table = getMasterTable(materialType);
  if (!table) return;

  const res = await query(`
    SELECT SUM(total_cost) as total_spent, SUM(base_quantity) as total_base_qty
    FROM material_purchases
    WHERE material_type = $1 AND material_id = $2
  `, [materialType, materialId]);

  let avgCost = 0;
  if (res.rows.length > 0 && res.rows[0].total_spent && res.rows[0].total_base_qty) {
    const totalSpent = parseFloat(res.rows[0].total_spent);
    const totalBaseQty = parseFloat(res.rows[0].total_base_qty);
    if (totalBaseQty > 0) {
      avgCost = totalSpent / totalBaseQty;
    }
  }

  await query(`UPDATE ${table} SET unit_cost = $1 WHERE id = $2`, [avgCost, materialId]);
  return avgCost;
}

// ─── List Purchases ────────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT p.*,
        CASE 
          WHEN p.material_type = 'wax' THEN wt.name
          WHEN p.material_type = 'fragrance' THEN f.name
          WHEN p.material_type = 'container' THEN ct.name
        END as material_name
      FROM material_purchases p
      LEFT JOIN wax_types wt ON p.material_type = 'wax' AND p.material_id = wt.id
      LEFT JOIN fragrances f ON p.material_type = 'fragrance' AND p.material_id = f.id
      LEFT JOIN container_types ct ON p.material_type = 'container' AND p.material_id = ct.id
      ORDER BY p.purchase_date DESC
    `);

    const mapped = result.rows.map(row => ({
      id: row.id,
      materialType: row.material_type,
      materialId: row.material_id,
      materialName: row.material_name || 'Unknown Material',
      quantity: parseFloat(row.quantity),
      unit: row.unit,
      baseQuantity: parseFloat(row.base_quantity),
      totalCost: parseFloat(row.total_cost),
      unitCostBase: parseFloat(row.unit_cost_base),
      supplier: row.supplier || '',
      notes: row.notes || '',
      purchaseDate: row.purchase_date.toISOString()
    }));

    res.json(mapped);
  } catch (err) {
    logger.error('GET /api/purchases failed', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Create Purchase ───────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const { materialType, materialId, quantity, unit, totalCost, supplier, notes } = req.body as {
      materialType: MaterialType;
      materialId: string;
      quantity: number;
      unit: MaterialUnit;
      totalCost: number;
      supplier?: string;
      notes?: string;
    };

    if (!materialType || !materialId || !quantity || quantity <= 0 || !totalCost || totalCost <= 0 || !unit) {
      res.status(400).json({ error: 'Material type, material ID, valid quantity, unit, and total cost are required.' });
      return;
    }

    const table = getMasterTable(materialType);
    if (!table) {
      res.status(400).json({ error: 'Invalid material type.' });
      return;
    }

    // Verify material exists
    const matCheck = await query(`SELECT id, name FROM ${table} WHERE id = $1`, [materialId]);
    if (matCheck.rows.length === 0) {
      res.status(404).json({ error: 'Material not found.' });
      return;
    }

    const multiplier = getMultiplier(unit);
    const baseQuantity = quantity * multiplier;
    const unitCostBase = totalCost / baseQuantity;
    const newId = `pur-${uuidv4()}`;

    const insertRes = await query(`
      INSERT INTO material_purchases 
      (id, material_type, material_id, quantity, unit, base_quantity, total_cost, unit_cost_base, supplier, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [newId, materialType, materialId, quantity, unit, baseQuantity, totalCost, unitCostBase, supplier || null, notes || null]);

    const row = insertRes.rows[0];
    const newAvgCost = await recalculateMaterialUnitCost(materialType, materialId);

    res.status(201).json({
      id: row.id,
      materialType: row.material_type,
      materialId: row.material_id,
      materialName: matCheck.rows[0].name,
      quantity: parseFloat(row.quantity),
      unit: row.unit,
      baseQuantity: parseFloat(row.base_quantity),
      totalCost: parseFloat(row.total_cost),
      unitCostBase: parseFloat(row.unit_cost_base),
      supplier: row.supplier || '',
      notes: row.notes || '',
      purchaseDate: row.purchase_date.toISOString(),
      updatedMaterialUnitCost: newAvgCost
    });
  } catch (err) {
    logger.error('POST /api/purchases failed', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Delete Purchase ───────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const check = await query('SELECT material_type, material_id FROM material_purchases WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Purchase record not found.' });
      return;
    }

    const { material_type, material_id } = check.rows[0];
    await query('DELETE FROM material_purchases WHERE id = $1', [id]);
    const newAvgCost = await recalculateMaterialUnitCost(material_type as MaterialType, material_id);

    res.json({ message: 'Purchase record deleted.', updatedMaterialUnitCost: newAvgCost });
  } catch (err) {
    logger.error('DELETE /api/purchases/:id failed', err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;

