// Sections beyond the P&L. page.js calls this after its own sections.
window.S1_EXTRA = function ({ section, cite, table, legend, D, C, money }) {
  // ---- customers
  const K = D.customers100k;
  section('customers', {
    short: 'Customers',
    title: 'Customers paying $100K+ a year: about 20 to more than 11,900',
    lede: `Customers with $100,000 or more of trailing-twelve-month revenue, at seven of the dates the filing gives. Between June and September 2026 it went from more than 6,000 to more than 11,900 (the filing gives only lower bounds). The filing also counts more than ${D.metrics.cust1m.toLocaleString()} customers above $1M and about ${D.metrics.cust10m} above $10M.`,
    src: cite(K.pg, K.q, 'S-1 p.142') + ' · ' + cite(D.metrics.pg, D.metrics.q, 'Sep 2026 figures, p.8') + ' · p.134, p.158',
    draw: p => C.columns(p, {
      labels: K.labels, values: K.values, height: 280,
      fmt: v => v.toLocaleString(), axisFmt: v => v >= 1000 ? (v / 1000) + 'K' : v,
      labelOnly: [0, 1, 4, 5, 6],
      tipHtml: i => `<b>${K.labels[i]}</b><br>${K.words[i]} customers at $100K+ TTM`,
    }),
    table: table(['As of', 'Customers at $100K+ TTM (as worded in the filing)'], K.labels.map((l, i) => [l, K.words[i]])),
  });

  // ---- price per share by round
  const R = D.rounds;
  const mult = Math.floor(R.price[5] / R.price[0]);
  section('rounds', {
    short: 'Price per share',
    title: `Series H was priced at ${mult}x the Series C price per share`,
    lede: `$${R.price[0].toFixed(2)} in mid-2023, $${R.price[5].toFixed(2)} in mid-2026. Anthropic had raised $${R.raised}B in total by June 30, 2026. The filing never states a dollar valuation; these per-share prices are the closest thing to one. (${(R.price[5] / R.price[0]).toFixed(1)}x is our arithmetic.)`,
    src: cite(R.pg, R.q, 'S-1 p.282–283') + ' · ' + cite(10, R.raisedQ, 'total raised, p.10'),
    draw: p => C.columns(p, {
      labels: R.labels.map(l => 'Series ' + l), values: R.price, height: 290,
      fmt: v => '$' + v.toFixed(0), axisFmt: v => '$' + v,
      tipHtml: i => `<b>Series ${R.labels[i]}</b><br>$${R.price[i]} per share<br><span class="k">${R.dates[i]}</span>`,
    }),
    after: `<p class="note">These are prices of preferred shares. A 10-for-1 split of the Class A and Class N common stock took effect on September 17, 2026, so don’t compare them with post-split common-share prices (${cite(21, 'a 10-for-one forward split of our Class A common stock and Class N common stock', 'split, p.21')}).</p>`,
    table: table(['Round', 'Dates', 'Price per share'], R.labels.map((l, i) => ['Series ' + l, R.dates[i], '$' + R.price[i]])),
  });

  // ---- operating cash flow
  const O = D.opCash;
  section('cash', {
    short: 'Cash flow',
    title: `Operating cash flow turned positive: ${money(O.values[4], { plus: true })} in H1 2026`,
    lede: `After burning ${money(-O.values[1])} in operating cash in 2024, the business generated ${money(O.values[4])} in the first half of 2026. Financing brought in far more: ${money(O.financing[4])} in H1 2026, which is why cash and short-term investments reached ${money(D.balance.cash)}.`,
    src: cite(O.pg, null, 'S-1 p.168, cash flows'),
    draw: p => C.columns(p, {
      labels: O.labels, values: O.values, height: 260, fmt: v => money(v, { plus: true }),
      color: (i, v) => v >= 0 ? 'var(--s3)' : 'var(--s8)',
      tipHtml: i => `<b>${O.labels[i]}</b><br>Operating cash flow ${money(O.values[i], { exact: true, plus: true })}<br><span class="k">Financing cash flow ${money(O.financing[i], { exact: true, plus: true })}</span>`,
    }),
    table: table(['Period', 'Operating ($M)', 'Financing ($M)'], O.labels.map((l, i) => [l, O.values[i].toLocaleString(), O.financing[i].toLocaleString()])),
  });

  // ---- revenue model
  const M = D.mix;
  const cPct = Math.round(M.consumption[4] / (M.consumption[4] + M.subscription[4]) * 100);
  section('mix', {
    short: 'Revenue mix',
    title: `${cPct}% of revenue is pay-per-use, and about half comes through cloud marketplaces`,
    lede: `Consumption (customers pay for what they use) versus subscriptions (enterprise plans and Claude Pro/Max). The filing doesn’t split out products like Claude Code. About ${M.marketplacePct[4]}% of H1 2026 revenue was sold through cloud provider marketplaces. Claude is sold on AWS, Google Cloud and Azure, but the filing doesn’t say how that 48% splits among them.`,
    legend: legend([['Consumption', 'var(--s1)'], ['Subscription', 'var(--s2)']]),
    src: cite('F-26', null, 'S-1 p.F-26, disaggregation of revenue') + ' · ' + cite('F-16', D.quotes[5].q, 'marketplaces, p.F-16'),
    draw: p => C.stacked(p, {
      labels: M.labels, height: 290, totalLabel: 'Revenue',
      series: [
        { name: 'Consumption', values: M.consumption, color: 'var(--s1)' },
        { name: 'Subscription', values: M.subscription, color: 'var(--s2)' },
      ],
    }),
    table: table(['Period', 'Consumption ($M)', 'Subscription ($M)', 'Via cloud marketplaces'], M.labels.map((l, i) => [l, M.consumption[i].toLocaleString(), M.subscription[i].toLocaleString(), '~' + M.marketplacePct[i] + '%'])),
  });

  // ---- compute deals
  const CD = D.computeDeals;
  const kindColor = { firm: 'var(--s1)', cancel: 'var(--s2)', est: 'var(--s7)' };
  section('compute', {
    short: 'Compute deals',
    title: 'Seven compute deals, with stated amounts of $41B to $161B each',
    lede: `For scale, H1 2026 revenue was ${money(D.annual.revenue[4])}. Only the SpaceXAI agreements can be cancelled without cause (either side, 90 days’ notice, after periods ending January and March 2027). The others are non-cancelable apart from breach and limited carve-outs: Microsoft’s undelivered tranches, Nscale’s delivery failures, and a lease contingency on $34.9B of Lambda. The terms mix “at least”, “up to” and estimates, so we don’t add them into one total. The filing’s own figure: $${CD.fixedMin}B of fixed or minimum commitments as of June 30, 2026, before more deals signed after that.`,
    legend: legend([['Non-cancelable (limited exceptions)', kindColor.firm], ['Cancelable without cause after early 2027', kindColor.cancel], ['Estimate, outside the commitments table', kindColor.est]]),
    src: cite(170, CD.rows[2].q, 'S-1 p.170–171, infrastructure arrangements') + ' · ' + cite(CD.fixedMinPg, CD.fixedMinQ, 'fixed or minimum, p.F-58'),
    draw: p => C.hbars(p, { labelW: 220, rows: CD.rows.map(r => ({ label: r.label, v: r.v, text: r.text || ('$' + r.v.toFixed(1) + 'B'), color: kindColor[r.kind], note: r.terms })) }),
    after: `<p class="note">A risk factor separately puts “the 2026 Lease Arrangement” at about $125.2B of rent over five years (${cite(CD.leaseNotePg, CD.leaseNoteQ, 'p.74')}); the $161.2B above is the filing’s figure for all the Broadcom leases.</p>`,
    table: table(['Counterparty', '$B', 'Terms (from the filing)'], CD.rows.map(r => [r.label, r.text || r.v.toFixed(1), r.terms])),
  });

  if (window.S1_EXTRA2) window.S1_EXTRA2({ section, cite, table, legend, D, C, money });

  // ---- lines worth reading
  section('lines', {
    short: 'Lines worth reading',
    title: 'Lines in the filing worth reading',
    lede: 'Paraphrased, with a link to the exact passage.',
    src: 'each line links to its passage',
    after: '<ol class="quotes">' + D.quotes.map(x => `<li>${x.text} <span class="qsrc">${cite(x.pg, x.q, 'p.' + x.pg)}</span></li>`).join('') + '</ol>',
  });
};
