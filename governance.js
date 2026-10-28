// "Who controls Anthropic" section, from data/governance.json (quotes re-checked by tools/check_cites.py).
window.S1_EXTRA2 = function ({ section, cite }) {
  const classes = [
    { name: 'Class F', who: '1 share, held by the Founder LLC of the seven co-founders', votes: '50.1% of the vote on general matters, fixed no matter how many shares are issued later', econ: 'No dividends', pg: 13, q: 'Our Class F common stock will be entitled to an aggregate number of votes that equals 50.1% of the total voting', color: 'var(--s2)' },
    { name: 'Class A', who: 'The shares sold in the IPO and held by existing holders', votes: '1 vote per share, together capped at 49.9% of voting power', econ: 'Full economics', pg: 288, q: 'Class A common stock is limited to an aggregate of 49.9% of the total outstanding voting power', color: 'var(--s1)' },
    { name: 'Class T', who: '1 share, held by the Long-Term Benefit Trust', votes: 'Elects and removes the Class T directors, a majority of the board. No automatic sunset', econ: 'No dividends', pg: 'cover page', q: 'Class T common stock, the LTBT generally has the authority', color: 'var(--s3)' },
    { name: 'Class N', who: 'Mainly strategic partners, plus a 5% stake given to the Anthropic Public Benefit Fund', votes: 'No vote. Converts to Class A when sold to an unaffiliated party', econ: 'Same economics as Class A', pg: 293, q: 'Holders of our Class N common stock are not entitled to vote on any matter', color: 'var(--s4)' },
    { name: 'Class E', who: 'Employees other than the co-founders', votes: 'Votes only on a few matters, mainly changes to the Trust and one board seat', econ: 'No dividends', pg: 249, q: 'Our Class E common stock will not have any right to vote except on certain specified matters', color: 'var(--s7)' },
  ];
  const card = c => `<div class="cls"><div class="cls-h"><i style="background:${c.color}"></i>${c.name}</div>
    <div class="cls-w">${c.who}</div><div class="cls-v">${c.votes}</div><div class="cls-e">${c.econ} · ${cite(c.pg, c.q, typeof c.pg === 'number' ? 'p.' + c.pg : c.pg)}</div></div>`;

  const facts = [
    ['The board', `Seven seats. The Trust’s Class T directors are Reed Hastings, Vas Narasimhan, Christopher Liddell and one vacancy. The other three are Dario Amodei, Daniela Amodei and Yasmin Razavi.`, 256, 'Class T directors will be Mr. Hastings, Dr. Narasimhan, Mr. Liddell, and one vacancy.'],
    ['The Trust', `Five trustee seats, one vacant: Neil “Buddy” Shah (chair), Richard Fontaine, Ben Bernanke, Christopher Stubbs. New trustees are appointed by a majority vote of the trustees.`, 245, 'Of the five authorized seats for Trustees, one is currently vacant.'],
    ['Overruling the Trust', `The Trust’s terms can be changed, or its share redeemed for nothing, without the trustees. For the first three years that takes all the continuing founders, a majority of Class E votes and a majority of Class A votes cast. After that it takes two-thirds of the founders, 75% of Class E votes and a majority of Class A votes cast.`, 245, 'upon approval of 85% of our outstanding shares of Class A common stock'],
    ['When the founder share ends', `Class F has no fixed end date. It ends 450 days after fewer than three continuing founders remain for 90 days, among other triggers. New founder-LLC members can be added only until the IPO’s tenth anniversary.`, 247, 'a successor member may be admitted to the Founder LLC'],
    ['A 5% stake for public benefit', `Anthropic gave 846,840,960 Class N shares, 5% of fully diluted shares, to its own Anthropic Public Benefit Fund, managed initially by Dario Amodei, Daniela Amodei, Jack Clark and Neil Shah.`, 12, 'we contributed 846,840,960'],
    ['Model transfers', `While Class T exists, the company must give the Trust advance notice before transferring control of an AI model above capability thresholds set by the board.`, 285, 'a transfer of control of an AI model exceeding'],
  ];

  section('control', {
    short: 'Who controls it',
    title: 'Public shareholders get at most 49.9% of the vote',
    lede: 'Five classes of common stock. A single founder share carries 50.1% of the vote on ordinary matters, a trust picks the board majority, and the big strategic holders get no vote at all. The filing calls this a “controlled company” under Nasdaq rules.',
    src: cite(244, 'Our Governance Structure and Its Goals', 'S-1 “Our Governance Structure and Its Goals”') + ' · ' + cite(289, null, 'Description of Capital Stock, p.289–296'),
    after: `<div class="cls-grid">${classes.map(card).join('')}</div>
      <dl class="facts">${facts.map(f => `<dt>${f[0]}</dt><dd>${f[1]} <span class="qsrc">${cite(f[2], f[3], 'p.' + f[2])}</span></dd>`).join('')}</dl>`,
  });
};
