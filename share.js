// "Save image": renders a chart card (title + chart + source + URL) to a PNG download.
(function () {
  const SITE = 'unknownhacker1.github.io/anthropic-s1';
  const PROPS = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'opacity', 'font-size', 'font-weight', 'font-family', 'text-anchor'];

  function inlineStyles(src, dst) {
    const cs = getComputedStyle(src);
    PROPS.forEach(p => { const v = cs.getPropertyValue(p); if (v) dst.style.setProperty(p, v); });
    for (let i = 0; i < src.children.length; i++) inlineStyles(src.children[i], dst.children[i]);
  }

  function wrap(ctx, text, maxW) {
    const words = text.split(' '), lines = [];
    let cur = '';
    words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur);
    return lines;
  }

  async function save(section, noDownload) {
    const svg = section.querySelector('.plot svg');
    if (!svg) return;
    const clone = svg.cloneNode(true);
    inlineStyles(svg, clone);
    clone.querySelectorAll('.hit').forEach(n => n.remove());
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const w = svg.width.baseVal.value, h = svg.height.baseVal.value;
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    await img.decode();

    const css = getComputedStyle(document.documentElement);
    const col = n => css.getPropertyValue(n).trim();
    const scale = 2, pad = 32, W = w + pad * 2;
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    const font = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.font = `700 26px ${font}`;
    const title = section.querySelector('h2').textContent;
    const tl = wrap(ctx, title, W - pad * 2);
    const legend = section.querySelector('.legend');
    const legendItems = legend ? [...legend.querySelectorAll('span')].map(s => [s.textContent, getComputedStyle(s.querySelector('i')).backgroundColor]) : [];
    const top = pad + tl.length * 32 + (legendItems.length ? 34 : 10);
    const H = top + h + 56;
    c.width = W * scale; c.height = H * scale;
    ctx.scale(scale, scale);
    ctx.fillStyle = col('--surface'); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = col('--ink'); ctx.font = `700 26px ${font}`; ctx.textBaseline = 'top';
    tl.forEach((l, i) => ctx.fillText(l, pad, pad + i * 32));
    let lx = pad;
    ctx.font = `14px ${font}`;
    legendItems.forEach(([name, color]) => {
      const y = pad + tl.length * 32 + 8;
      ctx.fillStyle = color; ctx.fillRect(lx, y + 2, 10, 10);
      ctx.fillStyle = col('--ink-2'); ctx.fillText(name, lx + 16, y);
      lx += 16 + ctx.measureText(name).width + 18;
    });
    ctx.drawImage(img, pad, top, w, h);
    ctx.fillStyle = col('--muted'); ctx.font = `14px ${font}`;
    const src = section.querySelector('.src span').textContent.replace(/\u2197/g, '').replace(/\s+/g, ' ').trim();
    ctx.fillText(src, pad, top + h + 14);
    ctx.textAlign = 'right'; ctx.fillText(SITE, W - pad, top + h + 14);

    if (noDownload) return c.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = 'anthropic-s1-' + section.id + '.png';
    a.href = c.toDataURL('image/png');
    a.click();
  }

  document.querySelectorAll('section.chart').forEach(s => {
    if (!s.querySelector('.plot svg')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tbl-toggle'; b.textContent = 'Save image';
    b.addEventListener('click', () => save(s).catch(e => console.error(e)));
    const src = s.querySelector('.src');
    const tbl = src.querySelector('.tbl-toggle');
    const box = document.createElement('span');
    box.style.display = 'flex'; box.style.gap = '14px';
    box.appendChild(b);
    if (tbl) box.appendChild(tbl);
    src.appendChild(box);
  });
  window.__chartPng = id => save(document.getElementById(id), true);
})();

// Export hook for tools: ?png=<sectionId> replaces the page with that chart's PNG data URL.
(function () {
  const id = new URLSearchParams(location.search).get('png');
  if (!id) return;
  window.__chartPng(id).then(u => { document.body.innerHTML = '<pre id="png">' + u + '</pre>'; });
})();
