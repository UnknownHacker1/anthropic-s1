// Tiny hand-rolled SVG charts. Each chart re-renders at its container's real width,
// so text stays legible on phones instead of being scaled down with a viewBox.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const tip = () => document.getElementById('tip');

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function text(parent, x, y, s, cls, anchor) {
    const t = el('text', { x, y, class: cls || 'ax', 'text-anchor': anchor || 'middle' }, parent);
    t.textContent = s;
    return t;
  }

  // $M in, compact dollars out: 376 -> $376M, 11555 -> $11.6B, -72388 -> -$72.4B
  function money(m, opts) {
    const o = opts || {};
    if (m === 0) return '$0';
    const neg = m < 0, a = Math.abs(m);
    let s;
    if (a >= 1000) s = '$' + (a / 1000).toFixed(a >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'B';
    else s = '$' + Math.round(a) + 'M';
    if (o.exact) s = '$' + a.toLocaleString('en-US') + 'M';
    return (neg ? '−' : (o.plus && m > 0 ? '+' : '')) + s;
  }

  function niceStep(span, count) {
    const raw = span / Math.max(1, count);
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }
  function ticks(lo, hi, count) {
    const step = niceStep(hi - lo, count);
    const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step;
    const out = [];
    for (let v = a; v <= b + step / 2; v += step) out.push(Math.round(v * 1e6) / 1e6);
    return out;
  }

  function showTip(evt, html) {
    const t = tip();
    t.innerHTML = html;
    t.style.opacity = 1;
    const pad = 14, w = t.offsetWidth, h = t.offsetHeight;
    let x = evt.clientX + pad, y = evt.clientY + pad;
    if (x + w > window.innerWidth - 8) x = evt.clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = evt.clientY - h - pad;
    t.style.left = Math.max(8, x) + 'px';
    t.style.top = Math.max(8, y) + 'px';
  }
  function hideTip() { tip().style.opacity = 0; }
  function bindHover(hit, marks, html) {
    const on = e => { marks.forEach(m => m.classList.add('hot')); showTip(e, html()); };
    hit.addEventListener('mousemove', on);
    hit.addEventListener('mouseleave', () => { marks.forEach(m => m.classList.remove('hot')); hideTip(); });
    hit.addEventListener('touchstart', e => { on(e.touches[0]); }, { passive: true });
  }

  // Column with a 4px rounded data end, square at the baseline (works up or down).
  function colPath(x, w, y0, y1) {
    const up = y1 < y0, h = Math.abs(y1 - y0);
    const r = Math.min(4, w / 2, h);
    if (h < 0.5) return '';
    if (up) return `M${x},${y0}V${y1 + r}Q${x},${y1} ${x + r},${y1}H${x + w - r}Q${x + w},${y1} ${x + w},${y1 + r}V${y0}Z`;
    return `M${x},${y0}V${y1 - r}Q${x},${y1} ${x + r},${y1}H${x + w - r}Q${x + w},${y1} ${x + w},${y1 - r}V${y0}Z`;
  }
  function rowPath(x0, x1, y, h) {
    const right = x1 > x0, w = Math.abs(x1 - x0);
    const r = Math.min(4, h / 2, w);
    if (w < 0.5) return '';
    if (right) return `M${x0},${y}H${x1 - r}Q${x1},${y} ${x1},${y + r}V${y + h - r}Q${x1},${y + h} ${x1 - r},${y + h}H${x0}Z`;
    return `M${x0},${y}H${x1 + r}Q${x1},${y} ${x1},${y + r}V${y + h - r}Q${x1},${y + h} ${x1 + r},${y + h}H${x0}Z`;
  }

  function frame(host, height) {
    host.innerHTML = '';
    const W = Math.max(280, host.clientWidth);
    const svg = el('svg', { width: W, height, viewBox: `0 0 ${W} ${height}`, role: 'img' }, host);
    return { svg, W };
  }

  // Single-series columns, positive and/or negative, value labels on caps.
  // opts: labels, values, color(i,v), fmt(v), tipHtml(i), height, labelEvery
  function columns(host, opts) {
    const H = opts.height || 300;
    const { svg, W } = frame(host, H);
    const m = { t: 22, r: 8, b: 30, l: 52 };
    const vals = opts.values;
    const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
    const tk = ticks(lo, hi, 4);
    const y = v => m.t + (tk[tk.length - 1] - v) / (tk[tk.length - 1] - tk[0]) * (H - m.t - m.b);
    tk.forEach(v => {
      el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: v === 0 ? 'base' : 'gridl' }, svg);
      text(svg, m.l - 8, y(v) + 4, (opts.axisFmt || money)(v), 'ax', 'end');
    });
    const n = vals.length, band = (W - m.l - m.r) / n;
    const bw = Math.min(opts.barMax || 44, band * 0.62);
    vals.forEach((v, i) => {
      const cx = m.l + band * i + band / 2;
      const p = el('path', { d: colPath(cx - bw / 2, bw, y(0), y(v)), fill: opts.color ? opts.color(i, v) : 'var(--s1)' }, svg);
      text(svg, cx, H - m.b + 18, opts.labels[i], 'ax');
      if (!opts.labelOnly || opts.labelOnly.includes(i)) {
        const ly = v >= 0 ? y(v) - 7 : y(v) + 16;
        text(svg, cx, ly, (opts.fmt || money)(v), 'lbl');
      }
      const hit = el('rect', { x: m.l + band * i, y: m.t, width: band, height: H - m.t - m.b, class: 'hit' }, svg);
      bindHover(hit, [p], () => opts.tipHtml ? opts.tipHtml(i) : `<b>${opts.labels[i]}</b><br>${money(v, { exact: true })}`);
    });
    return svg;
  }

  // Stacked columns of positive parts, with an optional overlay line (e.g. revenue).
  // opts: labels, series [{name, values, color}], overlay {name, values}, height
  function stacked(host, opts) {
    const H = opts.height || 320;
    const { svg, W } = frame(host, H);
    const m = { t: 22, r: 8, b: 30, l: 52 };
    const n = opts.labels.length;
    const totals = opts.labels.map((_, i) => opts.series.reduce((s, se) => s + se.values[i], 0));
    const hi = Math.max(...totals, ...(opts.overlay ? opts.overlay.values : [0]));
    const tk = ticks(0, hi, 4);
    const top = tk[tk.length - 1];
    const y = v => m.t + (top - v) / top * (H - m.t - m.b);
    tk.forEach(v => {
      el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: v === 0 ? 'base' : 'gridl' }, svg);
      text(svg, m.l - 8, y(v) + 4, money(v), 'ax', 'end');
    });
    const band = (W - m.l - m.r) / n, bw = Math.min(40, band * 0.56);
    const gap = 2;
    for (let i = 0; i < n; i++) {
      const cx = m.l + band * i + band / 2;
      let acc = 0;
      const marks = [];
      const parts = opts.series.filter(se => se.values[i] > 0);
      parts.forEach((se, k) => {
        const v = se.values[i];
        const y0 = y(acc) - (k > 0 ? gap / 2 : 0), y1 = y(acc + v) + (k < parts.length - 1 ? gap / 2 : 0);
        const isTop = k === parts.length - 1;
        const d = isTop ? colPath(cx - bw / 2, bw, y0, y1) : `M${cx - bw / 2},${y0}V${y1}H${cx + bw / 2}V${y0}Z`;
        if (y0 - y1 > 0.5) marks.push(el('path', { d, fill: se.color }, svg));
        acc += v;
      });
      text(svg, cx, H - m.b + 18, opts.labels[i], 'ax');
      const hit = el('rect', { x: m.l + band * i, y: m.t, width: band, height: H - m.t - m.b, class: 'hit' }, svg);
      bindHover(hit, marks, () => {
        let h = `<b>${opts.labels[i]}</b>`;
        if (opts.overlay) h += `<br><span class="k">${opts.overlay.name}</span> ${money(opts.overlay.values[i], { exact: true })}`;
        opts.series.slice().reverse().forEach(se => { if (se.values[i]) h += `<br><span class="k">${se.name}</span> ${money(se.values[i], { exact: true })}`; });
        h += `<br><span class="k">${opts.totalLabel || 'Total costs'}</span> ${money(totals[i], { exact: true })}`;
        return h;
      });
    }
    if (opts.overlay) {
      const pts = opts.overlay.values.map((v, i) => [m.l + band * i + band / 2, y(v)]);
      el('path', { d: 'M' + pts.map(p => p.join(',')).join('L'), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': '0' }, svg);
      pts.forEach(p => el('circle', { cx: p[0], cy: p[1], r: 4, fill: 'var(--ink)', stroke: 'var(--surface)', 'stroke-width': 2 }, svg));
      const last = pts[pts.length - 1];
      text(svg, last[0] - 10, last[1] - 10, opts.overlay.name, 'lbl', 'end');
    }
    return svg;
  }

  // Line with dots; one series. opts: labels, values, fmt, yMax, refLine {v, label}
  function line(host, opts) {
    const H = opts.height || 280;
    const { svg, W } = frame(host, H);
    const m = { t: 24, r: 16, b: 30, l: 52 };
    const hi = opts.yMax || Math.max(...opts.values);
    const tk = ticks(0, hi, 4), top = tk[tk.length - 1];
    const y = v => m.t + (top - v) / top * (H - m.t - m.b);
    tk.forEach(v => {
      el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: v === 0 ? 'base' : 'gridl' }, svg);
      text(svg, m.l - 8, y(v) + 4, opts.axisFmt ? opts.axisFmt(v) : v, 'ax', 'end');
    });
    const n = opts.values.length, band = (W - m.l - m.r) / n;
    const pts = opts.values.map((v, i) => [m.l + band * i + band / 2, y(v)]);
    if (opts.refLine) {
      const ry = y(opts.refLine.v);
      el('line', { x1: m.l, x2: W - m.r, y1: ry, y2: ry, stroke: 'var(--ink-2)', 'stroke-width': 1, 'stroke-dasharray': '3 4' }, svg);
      text(svg, W - m.r, ry - 6, opts.refLine.label, 'lbl2', 'end');
    }
    el('path', { d: 'M' + pts.map(p => p.join(',')).join('L') + `L${pts[n - 1][0]},${y(0)}L${pts[0][0]},${y(0)}Z`, fill: 'var(--wash)' }, svg);
    el('path', { d: 'M' + pts.map(p => p.join(',')).join('L'), fill: 'none', stroke: 'var(--s1)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    pts.forEach((p, i) => {
      const dot = el('circle', { cx: p[0], cy: p[1], r: 4.5, fill: 'var(--s1)', stroke: 'var(--surface)', 'stroke-width': 2 }, svg);
      text(svg, p[0], H - m.b + 18, opts.labels[i], 'ax');
      if (!opts.labelOnly || opts.labelOnly.includes(i)) text(svg, p[0], p[1] - 12, opts.fmt(opts.values[i]), 'lbl');
      const hit = el('rect', { x: p[0] - band / 2, y: m.t, width: band, height: H - m.t - m.b, class: 'hit' }, svg);
      bindHover(hit, [dot], () => opts.tipHtml ? opts.tipHtml(i) : `<b>${opts.labels[i]}</b><br>${opts.fmt(opts.values[i])}`);
    });
    return svg;
  }

  // Horizontal waterfall: each step floats from the running total; a total bar ends it.
  // opts: steps [{label, v, note}], total, totalLabel
  function waterfall(host, opts) {
    const rows = opts.steps.length + 1;
    const narrow = host.clientWidth < 560;
    const rh = 34, gap = 14, labelW = narrow ? 0 : 230;
    const H = rows * (rh + gap) + (narrow ? rows * 18 : 0) + 30;
    const { svg, W } = frame(host, H);
    const m = { t: 8, r: 70, l: labelW + 8 };
    let run = 0;
    const spans = opts.steps.map(s => { const a = run; run += s.v; return [a, run]; });
    const lo = Math.min(0, ...spans.flat(), opts.total), hi = Math.max(0, ...spans.flat());
    const tk = ticks(lo, hi, 4);
    const x = v => m.l + (v - tk[0]) / (tk[tk.length - 1] - tk[0]) * (W - m.l - m.r);
    const yRow = i => m.t + i * (rh + gap + (narrow ? 18 : 0)) + (narrow ? 18 : 0);
    tk.forEach(v => {
      el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - 26, class: v === 0 ? 'base' : 'gridl' }, svg);
      text(svg, x(v), H - 8, money(v), 'ax');
    });
    const all = opts.steps.map((s, i) => ({ ...s, span: spans[i] })).concat([{ label: opts.totalLabel || 'Net loss', v: opts.total, span: [0, opts.total], total: true }]);
    all.forEach((s, i) => {
      const yy = yRow(i);
      const [a, b] = s.span;
      const fill = s.total ? 'var(--ink)' : s.v >= 0 ? 'var(--s3)' : (s.accent ? 'var(--s2)' : 'var(--s1)');
      const p = el('path', { d: rowPath(x(a), x(b), yy, rh), fill }, svg);
      if (narrow) text(svg, m.l, yy - 6, s.label, 'lbl2', 'start');
      else {
        const t = text(svg, m.l - 12, yy + rh / 2 + 4, s.label, 'lbl2', 'end');
        if (s.label.length > 34) { t.textContent = s.label.slice(0, 32) + '…'; }
      }
      const endX = Math.min(x(a), x(b));
      const valX = endX - 8 < m.l + 40 ? Math.max(x(a), x(b)) + 8 : endX - 8;
      text(svg, valX, yy + rh / 2 + 4, money(s.v, { plus: true }), 'lbl', valX > Math.max(x(a), x(b)) ? 'start' : 'end');
      const hit = el('rect', { x: 0, y: yy - 4, width: W, height: rh + 8, class: 'hit' }, svg);
      bindHover(hit, [p], () => `<b>${s.label}</b><br>${money(s.v, { exact: true, plus: true })}${s.note ? '<br><span class="k">' + s.note + '</span>' : ''}`);
    });
    return svg;
  }

  // Horizontal bars, one value each. opts: rows [{label, v, color, note}], fmt
  function hbars(host, opts) {
    const narrow = host.clientWidth < 560;
    const rh = 22, gap = narrow ? 30 : 12, labelW = narrow ? 0 : (opts.labelW || 170);
    const H = opts.rows.length * (rh + gap) + 8;
    const { svg, W } = frame(host, H);
    const m = { l: labelW + 8, r: 76 };
    const hi = Math.max(...opts.rows.map(r => r.v));
    const x = v => m.l + v / hi * (W - m.l - m.r);
    opts.rows.forEach((r, i) => {
      const yy = i * (rh + gap) + (narrow ? 18 : 4);
      const p = el('path', { d: rowPath(x(0), x(r.v), yy, rh), fill: r.color || 'var(--s1)' }, svg);
      if (narrow) text(svg, m.l, yy - 5, r.label, 'lbl2', 'start');
      else text(svg, m.l - 10, yy + rh / 2 + 4, r.label, 'lbl2', 'end');
      text(svg, x(r.v) + 8, yy + rh / 2 + 4, r.text || (opts.fmt || money)(r.v), 'lbl', 'start');
      const hit = el('rect', { x: 0, y: yy - 4, width: W, height: rh + 8, class: 'hit' }, svg);
      bindHover(hit, [p], () => `<b>${r.label}</b><br>${r.text || (opts.fmt || money)(r.v)}${r.note ? '<br><span class="k">' + r.note + '</span>' : ''}`);
    });
    return svg;
  }

  window.Charts = { columns, stacked, line, waterfall, hbars, money };
})();
