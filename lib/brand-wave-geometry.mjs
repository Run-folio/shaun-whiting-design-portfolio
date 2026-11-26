// Screen-space art direction: the same stable contour drives both the real-time
// points and the server-rendered fallback. Coordinates are fractions from top left.
export const mobileWidth = 760;

/** @param {number} width @param {number} height */
export function buildWave(width, height) {
  const narrow = width <= mobileWidth;
  const rows = narrow ? 5 : 9;
  const columns = Math.max(21, Math.min(155, Math.round(width / (narrow ? 12 : 14)) + 1));
  const accentColumn = Math.round((columns - 1) * .875);
  const dots = [];
  for (let row = 0; row < rows; row++) {
    const v = row / (rows - 1) - .5;
    for (let column = 0; column < columns; column++) {
      const x = column / (columns - 1);
      // Slight divergence in the band, never orbit or rotate a sheet across the text.
      const curve = Math.cos((x - .105 + .018 * v) * Math.PI / .655);
      const mid = narrow ? .962 + .026 * curve : .46 + .365 * curve;
      const span = narrow ? Math.min(.048, 20 / height) :
        Math.min(.20, (56 + 24 * x + 10 * Math.sin(Math.PI*x)) / height);
      const y = mid + v * span;
      dots.push({ x, y, row, column, accent: column === accentColumn && row === (narrow ? 1 : 2) });
    }
  }
  return { rows, columns, dots, narrow };
}

/** Retains original reference proportions at the two representative breakpoints.
 * Each dot is a round-capped sub-pixel path; non-scaling strokes stay round.
 *  @param {number} width @param {number} height */
export function waveSvg(width, height) {
  const { dots, narrow } = buildWave(width,height);
  const point = p => 'M'+(p.x*width).toFixed(1)+' '+(p.y*height).toFixed(1)+'h.001';
  const accent = dots.find(p=>p.accent);
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'" preserveAspectRatio="none"><g fill="none" stroke-linecap="round"><path vector-effect="non-scaling-stroke" d="'+dots.filter(p=>!p.accent).map(point).join('')+'" stroke="#f2f5fa" stroke-opacity=".83" stroke-width="'+(narrow?1.65:2.15)+'"/><path vector-effect="non-scaling-stroke" d="'+point(accent)+'" stroke="#25e6d1" stroke-width="'+(narrow?9:15)+'"/></g></svg>\n';
}
