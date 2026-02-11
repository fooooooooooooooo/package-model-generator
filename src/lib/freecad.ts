import { BODY_COLOR, PAD_COLOR } from '@/lib/colors';
import { toName, toSolids, type PackageConfig } from '@/lib/packages';
import type { Solid } from '@/lib/types';

function color(hex: number): string {
  const r = ((hex >> 16) & 0xff) / 255;
  const g = ((hex >> 8) & 0xff) / 255;
  const b = (hex & 0xff) / 255;
  return `(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`;
}

/**
 * Generate a FreeCAD Python script that creates a colored part
 * from an array of Solids (bodies and pads).
 *
 * Designed to be pasted into FreeCAD's Python console.
 * The user can then manually export via File > Export.
 *
 * The script will:
 *  1. Create a new document
 *  2. Add a Part::Box for each solid, positioned by its center
 *  3. Fuse all body shapes into one "Body" feature, colored dark gray
 *  4. Fuse all pad shapes into one "Pads" feature, colored light silver
 *  5. Hide the individual source shapes
 */
export function solidsToFreeCADScript(name: string, solids: Solid[]): string {
  const lines: string[] = [];

  function emit(line = '') {
    lines.push(line);
  }

  emit('# Auto-generated FreeCAD script');
  emit('# Paste into FreeCAD Python console, then export via File > Export');
  emit('');
  emit('import FreeCAD');
  emit('import Part');
  emit('');
  emit(`doc = FreeCAD.newDocument("${name}")`);
  emit('');

  const bodyNames: string[] = [];
  const padNames: string[] = [];

  solids.forEach((solid, index) => {
    const name = `${solid.type}_${index}`;
    const [cx, cy, cz] = solid.position;
    const [sx, sy, sz] = solid.size;

    // Part::Box places the box at its corner, so offset from center by -size/2
    const ox = cx - sx / 2;
    const oy = cy - sy / 2;
    const oz = cz - sz / 2;

    emit(`# ${solid.type} ${index}: size=(${sx}, ${sy}, ${sz}) center=(${cx}, ${cy}, ${cz})`);
    emit(`${name} = doc.addObject("Part::Box", "${name}")`);
    emit(`${name}.Length = ${sx}`);
    emit(`${name}.Width = ${sy}`);
    emit(`${name}.Height = ${sz}`);
    emit(`${name}.Placement = FreeCAD.Placement(FreeCAD.Vector(${ox}, ${oy}, ${oz}), FreeCAD.Rotation())`);
    emit('');

    if (solid.type === 'body') {
      bodyNames.push(name);
    } else {
      padNames.push(name);
    }
  });

  emit('doc.recompute()');
  emit('');

  // Fuse + color a group of shapes, hide originals
  function emitFuseAndColor(label: string, names: string[], color: string): string | null {
    if (names.length === 0) return null;

    if (names.length === 1) {
      emit(`doc.getObject("${names[0]}").Label = "${label}"`);
      emit(`doc.getObject("${names[0]}").ViewObject.ShapeColor = ${color}`);
      emit('');
      return names[0]!;
    }

    const fuseVar = `${label}_fuse`;
    emit(`${fuseVar} = doc.addObject("Part::MultiFuse", "${label}")`);
    emit(`${fuseVar}.Shapes = [${names.map((n) => `doc.getObject("${n}")`).join(', ')}]`);
    emit(`${fuseVar}.Label = "${label}"`);
    emit('doc.recompute()');
    emit(`${fuseVar}.ViewObject.ShapeColor = ${color}`);
    emit('');

    // Hide source shapes
    for (const n of names) {
      emit(`doc.getObject("${n}").ViewObject.Visibility = False`);
    }
    emit('');

    return label;
  }

  emitFuseAndColor('Body', bodyNames, color(BODY_COLOR));
  emitFuseAndColor('Pads', padNames, color(PAD_COLOR));

  emit('doc.recompute()');
  emit('FreeCADGui.ActiveDocument.ActiveView.fitAll()');

  return lines.join('\n');
}

export function configToFreeCADScript(config: PackageConfig): string {
  return solidsToFreeCADScript(toName(config), toSolids(config));
}
