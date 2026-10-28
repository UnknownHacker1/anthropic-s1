// Builds the page from window.S1. Each section = headline, lede, chart, source line, table.
(function () {
  const D = window.S1, C = window.Charts, money = C.money;
  const main = document.getElementById('main');
  const renders = [];

  // Link that opens the filing and highlights the quoted phrase (text fragment).
  function cite(pg, q, label) {
    // '-' and '&' are delimiters inside a text fragment, so escape them too
    const href = D.url + (q ? '#:~:text=' + encodeURIComponent(q).replace(/-/g, '%2D') : '');
    const hint = q ? ` title="Opens the filing at this passage. If it doesn’t jump, search the page for: ${q.replace(/"/g, '&quot;')}"` : '';
    return `<a href="${href}" target="_blank" rel="noopener"${hint}>${label || 'S-1 p.' + pg} ↗</a>`;
  }

  function table(head, rows) {
    return '<div class="tbl-wrap"><table class="data"><thead><tr>' + head.map(h => `<th>${h}</th>`).join('') +
      '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>';
  }

  let count = 0;
  function section(id, o) {
    count++;
    const s = document.createElement('section');
    s.className = 'chart';
    s.id = id;
    s.innerHTML = `<div class="num">${String(count).padStart(2, '0')}</div><h2>${o.title}</h2><p class="lede">${o.lede}</p>
      <div class="card">${o.legend || ''}<div class="plot"></div>${o.after || ''}
      <div class="src"><span>Source: ${o.src}</span>${o.table ? '<button class="tbl-toggle" type="button">Show table</button>' : ''}</div>
      <div class="tbl" hidden>${o.table || ''}</div></div>`;
    main.appendChild(s);
    const plot = s.querySelector('.plot');
    // Screen readers get the headline as the chart's name, plus the table toggle state
    const name = o.title.replace(/<[^>]+>/g, '');
    if (o.draw) {
      const r = () => { o.draw(plot); const svg = plot.querySelector('svg'); if (svg) svg.setAttribute('aria-label', name); };
      renders.push(r); r();
    }
    const tb = s.querySelector('.tbl-toggle');
    if (tb) {
      const t = s.querySelector('.tbl');
      t.id = id + '-table';
      tb.setAttribute('aria-controls', t.id);
      tb.setAttribute('aria-expanded', 'false');
      tb.addEventListener('click', () => {
        t.hidden = !t.hidden; tb.textContent = t.hidden ? 'Show table' : 'Hide table';
        tb.setAttribute('aria-expanded', String(!t.hidden));
      });
    }
    const a = document.createElement('a');
    a.href = '#' + id; a.textContent = o.short || o.title;
    document.getElementById('toc').appendChild(a);
    return s;
  }
  const legend = items => '<div class="legend">' + items.map(([n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join('') + '</div>';

  // ---- header
  document.getElementById('filed').textContent = D.filed;
  document.getElementById('srcLink').href = D.url;
  const Q = D.quarters, A = D.annual;
  const tiles = [
    ['Revenue, H1 2026', money(A.revenue[4]), 'vs ' + money(A.revenue[3]) + ' in H1 2025'],
    ['Operating income, Q2 2026', money(Q.opIncome[5], { plus: true }), 'first of the six quarters reported'],
    ['Cash, equivalents and short-term investments', '$131.7B', 'as of ' + D.balance.asOf],
    ['Net revenue retention', '~' + D.metrics.nrr + '%', 'as of Sep 30, 2026; company-defined, excludes Pro/Max'],
  ];
  document.getElementById('tiles').innerHTML = tiles.map(t => `<div class="tile"><div class="lab">${t[0]}</div><div class="val">${t[1]}</div><div class="sub">${t[2]}</div></div>`).join('');

  // ---- 1. quarterly revenue
  const x30 = (Q.revenue[5] / Q.revenue[0]).toFixed(1);
  section('revenue', {
    short: 'Revenue',
    title: `Quarterly revenue grew ${x30}x in five quarters`,
    lede: `From ${money(Q.revenue[0])} in Q1 2025 to ${money(Q.revenue[5])} in Q2 2026. The filing says Q2 revenue grew ${D.metrics.growthQ2.toLocaleString()}% year over year. Q2 2026 alone brought in more than all of 2025 (${money(A.revenue[2])}). The ${x30}x is our arithmetic.`,
    src: cite(Q.pg, Q.q, 'S-1 p.157, quarterly results') + ' · ' + cite(10, D.metrics.growthQ, 'growth claim, p.10'),
    draw: p => C.columns(p, { labels: Q.labels, values: Q.revenue, height: 300 }),
    table: table(['Quarter', 'Revenue ($M)'], Q.labels.map((l, i) => [l, Q.revenue[i].toLocaleString()])),
  });

  // ---- 2. compute per revenue dollar
  section('compute-ratio', {
    short: 'Compute per $1',
    title: 'Compute cost per dollar of revenue fell from $2.51 to $0.48',
    lede: 'Compute and infrastructure was 251% of revenue in Q1 2025: every dollar of sales cost $2.51 in compute alone. By Q2 2026 it was 48%. By our arithmetic, that one line accounts for about 80% of the swing in operating margin, from −249% to +8%. (The net loss did not close; see below.)',
    src: cite(158, 'Quarterly Consolidated Statements of Operations, as a Percentage of Revenue', 'S-1 p.158, % of revenue'),
    draw: p => C.line(p, {
      labels: Q.labels, values: Q.computePct, height: 280, fmt: v => '$' + (v / 100).toFixed(2), axisFmt: v => v + '%',
      refLine: { v: 100, label: 'break-even on compute alone' },
      tipHtml: i => `<b>${Q.labels[i]}</b><br>Compute: ${money(Q.compute[i], { exact: true })}<br>Revenue: ${money(Q.revenue[i], { exact: true })}<br>${Q.computePct[i]}% of revenue`,
    }),
    table: table(['Quarter', 'Compute ($M)', 'Revenue ($M)', '% of revenue'], Q.labels.map((l, i) => [l, Q.compute[i].toLocaleString(), Q.revenue[i].toLocaleString(), Q.computePct[i] + '%'])),
  });

  // ---- 3. operating income by quarter
  section('op-income', {
    short: 'First profit',
    title: 'Q2 2026: the first operating profit of the six quarters reported',
    lede: `Five straight quarters of operating losses, then ${money(Q.opIncome[5], { plus: true })} in Q2 2026. Every full year from 2023 to 2025 was also an operating loss. Q3 2025 includes the one-time ${money(Q.bartz[2])} Bartz settlement. Stock-based compensation is already counted in these costs (${money(Q.sbc[5])} in Q2 2026).`,
    src: cite(Q.pg, Q.q, 'S-1 p.157, quarterly results'),
    draw: p => C.columns(p, {
      labels: Q.labels, values: Q.opIncome, height: 280, fmt: v => money(v, { plus: true }),
      color: (i, v) => v >= 0 ? 'var(--s3)' : 'var(--s8)',
      tipHtml: i => `<b>${Q.labels[i]}</b><br>Operating income: ${money(Q.opIncome[i], { exact: true, plus: true })}${Q.bartz[i] ? '<br><span class="k">includes $1,500M Bartz settlement</span>' : ''}`,
    }),
    table: table(['Quarter', 'Operating income ($M)'], Q.labels.map((l, i) => [l, Q.opIncome[i].toLocaleString()])),
  });

  // ---- 4. the loss waterfall
  const L = D.h1Loss;
  const fv = L.steps[2].v + L.steps[3].v;
  const ex = L.steps[0].v + L.steps[1].v; // pre-tax result without the two fair-value lines
  section('loss', {
    short: 'The $80.7B loss',
    title: `The ${money(L.total).replace('−', '')} H1 2026 loss is more than covered by ${money(-fv)} of non-cash fair-value charges`,
    lede: `Two non-cash fair-value lines add up to ${money(fv)} (our sum), more than the entire net loss. The larger one (${money(L.steps[2].v)}) is, per the filing, mainly the convertible notes being marked up as Anthropic’s valuation rose; the other (${money(L.steps[3].v)}) is fair-value accounting on note purchase agreements. Without them, H1 2026 is ${money(ex, { plus: true })} before tax (our arithmetic from the filing’s lines; the company’s own adjusted net income is ${money(A.adjNetIncome[4], { plus: true })}).`,
    src: cite(L.pg, L.q, 'S-1 p.22') + ' · ' + cite(L.otherPg, L.otherQ, 'other expense explained, p.160'),
    draw: p => C.waterfall(p, { steps: L.steps.map((s, i) => ({ ...s, accent: i === 2 || i === 3 })), total: L.total, totalLabel: 'Net loss, H1 2026' }),
    after: '<p class="note">Why a rising valuation shows up as a loss (the $72.4B line): the convertible notes turn into stock. When the company is worth more, the notes are worth more, and the extra value owed to holders is booked as an expense. No cash leaves the company.</p>',
    table: table(['Line, H1 2026', '$M'], L.steps.map(s => [s.label, s.v.toLocaleString()]).concat([['Net loss', L.total.toLocaleString()]])),
  });

  // ---- 5. where the money goes
  section('costs', {
    short: 'Costs',
    title: 'Revenue passed total operating costs in Q2 2026',
    lede: 'Operating costs by quarter, with revenue as the line. Compute is still the biggest cost, but sales and marketing grew fastest: 22x between Q2 2025 and Q2 2026 (our arithmetic).',
    legend: legend([['Compute and infrastructure', 'var(--s1)'], ['Personnel', 'var(--s2)'], ['Sales, marketing, partnerships', 'var(--s3)'], ['Other operating and admin', 'var(--s4)'], ['Bartz settlement', 'var(--s5)'], ['Revenue', 'var(--ink)']]),
    src: cite(Q.pg, Q.q, 'S-1 p.157, quarterly results'),
    draw: p => C.stacked(p, {
      labels: Q.labels, height: 320,
      series: [
        { name: 'Compute and infrastructure', values: Q.compute, color: 'var(--s1)' },
        { name: 'Personnel', values: Q.personnel, color: 'var(--s2)' },
        { name: 'Sales, marketing, partnerships', values: Q.sales, color: 'var(--s3)' },
        { name: 'Other operating and admin', values: Q.other, color: 'var(--s4)' },
        { name: 'Bartz settlement', values: Q.bartz, color: 'var(--s5)' },
      ],
      overlay: { name: 'Revenue', values: Q.revenue },
    }),
    table: table(['Quarter', 'Compute', 'Personnel', 'Sales & mktg', 'Other', 'Bartz', 'Revenue'],
      Q.labels.map((l, i) => [l, Q.compute[i], Q.personnel[i], Q.sales[i], Q.other[i], Q.bartz[i], Q.revenue[i]].map((c, j) => j ? c.toLocaleString() : c))),
  });

  // Sections added from the other data files (compute commitments, control, customers)
  if (window.S1_EXTRA) window.S1_EXTRA({ section, cite, table, legend, D, C, money });

  document.getElementById('buildNote').textContent = 'Page built ' + new Date(document.lastModified).toISOString().slice(0, 10) + '.';

  // ---- theme toggle + responsive re-render
  const btn = document.getElementById('themeBtn');
  const sysDark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : sysDark.matches;
  const label = () => { btn.textContent = isDark() ? 'Light mode' : 'Dark mode'; };
  try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  label();
  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
  });
  sysDark.addEventListener('change', label);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => renders.forEach(r => r()), 120); });
  window.__rerender = () => renders.forEach(r => r());
})();
