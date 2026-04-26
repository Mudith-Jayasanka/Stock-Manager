const fabric = require('fabric');

const canvas = new fabric.Canvas(null, { width: 500, height: 500 });
const text = new fabric.IText('{{ VARIABLE }}', {
  left: 10,
  top: 20,
  originX: 'left',
  originY: 'center',
  textAlign: 'left',
  fontFamily: 'Arial',
  fontSize: 14,
});
canvas.add(text);
const before = text.getBoundingRect();

const json = canvas.toJSON(['customType', 'mappedField']);

const canvas2 = new fabric.Canvas(null, { width: 500, height: 500 });
canvas2.loadFromJSON(json).then(() => {
  const t = canvas2.getObjects()[0];
  t.set('text', '2026-04-26');
  canvas2.renderAll();
  const after = t.getBoundingRect();
  console.log('Before left:', before.left, 'width:', before.width);
  console.log('After left:', after.left, 'width:', after.width);
});
