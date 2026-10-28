// Every figure on the page lives here, with where it came from in the S-1.
// pg = printed page number in the filing. q = exact phrase used as a text-fragment link.
window.S1 = {
  url: 'https://www.sec.gov/Archives/edgar/data/2130357/000162828026067168/anthropicpbc-sx1.htm',
  filed: 'October 26, 2026',

  // Quarterly statements of operations, $M (S-1 p.157)
  quarters: {
    labels: ['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26', 'Q2 26'],
    revenue:   [376, 787, 1382, 2040, 4731, 11555],
    compute:   [944, 1390, 2047, 2945, 3387, 5558],
    personnel: [218, 320, 489, 812, 1295, 1857],
    bartz:     [0, 0, 1500, 0, 0, 0],
    sales:     [24, 96, 202, 246, 1033, 2135],
    other:     [125, 181, 233, 873, 683, 1031],
    opIncome:  [-935, -1200, -3089, -2836, -1667, 974],
    fairValue: [-5701, -5241, -9165, -14201, -12791, -59597],
    netLoss:   [-6592, -6377, -12138, -16858, -14439, -66309],
    sbc:       [105, 181, 305, 574, 924, 1300],
    // compute and infrastructure as % of revenue (S-1 p.158)
    computePct: [251, 177, 148, 144, 72, 48],
    pg: 157, q: 'Quarterly Consolidated Statements of Operations',
  },

  // Annual + half-year summary, $M (S-1 p.22)
  annual: {
    labels: ['2023', '2024', '2025', 'H1 25', 'H1 26'],
    revenue: [41, 386, 4585, 1163, 16286],
    compute: [433, 2522, 7326, 2334, 8945],
    personnel: [95, 454, 1839, 538, 3152],
    bartz: [0, 0, 1500, 0, 0],
    sales: [2, 43, 568, 120, 3168],
    other: [62, 347, 1412, 306, 1714],
    opex: [592, 3366, 12645, 3298, 16979],
    opLoss: [-551, -2980, -8060, -2135, -693],
    interest: [69, 106, 431, 115, 1111],
    fairValue: [-1045, -5434, -34308, -10942, -72388],
    otherIncome: [-2, 0, -8, 0, -8757],
    tax: [2, 1, 20, 7, 21],
    netLoss: [-1531, -8309, -41965, -12969, -80748],
    adjOpIncome: [-522, -2788, -4854, -1849, 1618],
    adjNetIncome: [-457, -2683, -4448, -1741, 2671],
    pg: 22, q: 'Summary Consolidated Financial and Other Data',
  },

  // H1 2026 net loss, decomposed (S-1 p.22; other expense explained p.160)
  h1Loss: {
    steps: [
      { label: 'Operating loss', v: -693, note: 'The actual business: revenue minus every operating cost, including $2.2B of stock comp.' },
      { label: 'Interest income', v: 1111, note: 'Interest on its cash and short-term investments (a $131.7B balance at June 30, 2026; lower for most of the half).' },
      { label: 'Fair value of convertible notes, derivatives, SAFEs', v: -72388, note: 'Non-cash. Per the filing, mainly driven by increases in Anthropic’s enterprise valuation: the notes convert to stock, so the liability is marked up and booked as a loss.' },
      { label: 'Other expense (note purchase agreements)', v: -8757, note: 'Also non-cash: initial fair value recognition and later changes in the fair value of assets and liabilities under note purchase agreements (S-1 p.160).' },
      { label: 'Income taxes', v: -21, note: 'Provision for income taxes.' },
    ],
    total: -80748,
    pg: 22, q: 'Change in fair value of convertible',
    otherPg: 160, otherQ: 'initial fair value recognition and subsequent change in fair value',
  },

  balance: {
    cash: 131651, totalAssets: 147358, totalLiabilities: 117467, preferred: 157510,
    deficit: -132902, stockholdersDeficit: -127619,
    asOf: 'June 30, 2026', pg: 24, q: 'Cash, cash equivalents, and short-term investments',
  },

  metrics: {
    cust100k: 11900, cust1m: 1900, cust10m: 250,
    nrr: 900, growthQ2: 1368, revPerEmployee: 6.6,
    pg: 8, q: 'More than 11,900 customers', metricsPg: 10,
    growthQ: '1,368%',
    nrrQ: 'Net Revenue Retention of approximately 900%',
    rpeQ: 'TTM revenue per employee of over $6.6 million',
  },

  shareClasses: {
    pg: 'cover', q: 'Class T common stock, the LTBT generally has the authority',
    ticker: 'ANT', exchange: 'Nasdaq Global Select Market',
  },
};
