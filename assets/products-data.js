/* Structured product data — single source of truth for products.html.
   Reused later by any standalone /products/<slug>.html page. */
window.TF_PRODUCTS = [
  {
    id: 'pms',
    slug: 'pms',
    name: 'Portfolio Management Services',
    shortName: 'PMS',
    icon: '📊',
    tagline: 'A professionally managed portfolio built around your goals, risk profile and wealth objectives.',
    positioning: 'For investors seeking professional portfolio management',
    pillars: ['Personalised', 'Active', 'High-touch'],
    description: 'Access India’s top PMS providers through a single window. We evaluate, compare, and recommend strategies aligned with your risk profile.',
    minInvestment: '₹50L',
    whyChoose: [
      'Personalised investment strategy',
      'Professional portfolio management',
      'Continuous monitoring',
      'Portfolio review and rebalancing',
      'Goal-oriented allocation'
    ],
    whoFor: 'Investors with ₹50L+ investable surplus who want direct, professionally managed equity exposure rather than pooled fund structures.',
    subcategories: [
      { name: 'Multi-Cap', desc: 'Diversified exposure across large, mid and small-cap companies.' },
      { name: 'Flexi-Cap', desc: 'Dynamic allocation that shifts with market opportunity.' },
      { name: 'Quant-Based', desc: 'Systematic, data-driven stock selection and rebalancing.' },
      { name: 'Thematic', desc: 'Concentrated bets on specific sectors or structural themes.' }
    ],
    howWeHelp: [
      { title: 'Understand', desc: 'Assess your goals, risk profile and existing allocation.' },
      { title: 'Shortlist', desc: 'Compare across 15+ PMS strategies for the right fit.' },
      { title: 'Onboard', desc: 'Facilitate direct access with the chosen PMS provider.' },
      { title: 'Review', desc: 'Quarterly performance and allocation reviews.' }
    ],
    eligibility: 'SEBI-mandated minimum investment of ₹50 lakh for Portfolio Management Services. Standard KYC and AMFI/APMI-compliant onboarding applies.',
    ctaLabel: 'Explore PMS',
    calculatorType: 'management-value',
    tags: ['Min ₹50L', '15+ Strategies', 'Direct Access', 'Quarterly Reviews'],
    comparison: {
      idealFor: '₹50L+ investors wanting direct equity exposure',
      approach: 'Personalised, professionally managed strategy',
      riskProfile: 'Moderate to High',
      timeHorizon: '5+ years',
      professionalManagement: 'Yes — dedicated strategy',
      portfolioReview: 'Quarterly'
    }
  },
  {
    id: 'mutual-funds',
    slug: 'mutual-funds',
    name: 'Mutual Funds',
    shortName: 'Mutual Funds',
    icon: '💰',
    tagline: 'Goal-based mutual fund portfolios across equity, debt, hybrid and international categories.',
    positioning: 'For diversified long-term wealth creation',
    pillars: ['Diversified', 'Flexible', 'Goal-based'],
    description: 'SIP planning, lump-sum deployment, and tax-efficient withdrawal strategies — all under one roof.',
    minInvestment: null,
    whyChoose: [
      'Diversification across sectors and fund houses',
      'Professional fund management',
      'Multiple investment strategies — SIP or lump sum',
      'Tax-efficient withdrawal planning'
    ],
    whoFor: 'Investors building long-term wealth through disciplined, goal-based investing — no strict minimum ticket size.',
    subcategories: [
      { name: 'Equity Funds', desc: 'Growth-focused exposure to listed businesses.' },
      { name: 'Debt Funds', desc: 'Stability and income through fixed-income instruments.' },
      { name: 'Hybrid Funds', desc: 'A blend of equity and debt for balanced risk.' },
      { name: 'International Funds', desc: 'Diversification beyond Indian markets.' }
    ],
    howWeHelp: [
      { title: 'Understand', desc: 'Define your goal, horizon and risk comfort.' },
      { title: 'Curate', desc: 'Shortlist funds across 40+ AMCs that fit your goal.' },
      { title: 'Deploy', desc: 'Set up SIP or lump-sum investment.' },
      { title: 'Track', desc: 'Ongoing tracking and rebalancing as goals evolve.' }
    ],
    eligibility: 'No strict minimum investment. Standard KYC (PAN, address proof) applies as per AMFI norms.',
    ctaLabel: 'Explore Mutual Funds',
    calculatorType: 'sip-lumpsum',
    tags: ['40+ AMCs', 'SIP / Lump Sum', 'Goal Planning', 'Tax Efficient'],
    comparison: {
      idealFor: 'Goal-based, disciplined investors',
      approach: 'Pooled, professionally managed schemes',
      riskProfile: 'Low to High, fund-dependent',
      timeHorizon: '3+ years (SIP)',
      professionalManagement: 'Yes — fund manager led',
      portfolioReview: 'As needed'
    }
  },
  {
    id: 'aif',
    slug: 'aif',
    name: 'AIF & Structured Products',
    shortName: 'AIF',
    icon: '🏦',
    tagline: 'Access to Alternative Investment Funds and structured opportunities for ultra-HNI capital.',
    positioning: 'For sophisticated investors seeking alternative strategies',
    pillars: ['Alternative', 'Selective', 'Long-term'],
    description: 'For ultra-HNI clients, we facilitate access to Alternative Investment Funds (Cat I, II, III), pre-IPO opportunities, and structured debt instruments.',
    minInvestment: '₹1Cr',
    whyChoose: [
      'Access to Category I, II & III Alternative Investment Funds',
      'Pre-IPO opportunity access',
      'Curated structured debt instruments',
      'Suited for concentrated, higher-conviction capital'
    ],
    whoFor: 'Ultra-HNI investors with ₹1Cr+ investable surplus seeking exposure beyond traditional mutual funds and PMS.',
    subcategories: [
      { name: 'Category I AIF', desc: 'Venture capital, SME and infrastructure-focused funds.' },
      { name: 'Category II AIF', desc: 'Private equity and debt funds without leverage.' },
      { name: 'Category III AIF', desc: 'Complex trading strategies, including listed derivatives.' },
      { name: 'Structured Debt / Pre-IPO', desc: 'Curated fixed-income and pre-listing opportunities.' }
    ],
    howWeHelp: [
      { title: 'Assess', desc: 'Evaluate suitability for AIF-level investing.' },
      { title: 'Shortlist', desc: 'Compare Cat I/II/III strategies against your goals.' },
      { title: 'Onboard', desc: 'Facilitate documentation and fund onboarding.' },
      { title: 'Oversee', desc: 'Ongoing portfolio oversight and reporting.' }
    ],
    eligibility: 'SEBI-mandated minimum investment of ₹1 crore for AIFs. Suitable only for informed investors with a higher risk appetite.',
    ctaLabel: 'Explore AIF',
    calculatorType: 'lumpsum',
    tags: ['Cat I / II / III', 'Min ₹1Cr', 'Pre-IPO', 'Structured Notes'],
    comparison: {
      idealFor: '₹1Cr+ ultra-HNI investors',
      approach: 'Alternative and structured strategies',
      riskProfile: 'High',
      timeHorizon: '5+ years',
      professionalManagement: 'Yes — fund manager led',
      portfolioReview: 'Periodic, strategy-dependent'
    }
  },
  {
    id: 'portfolio-overhaul',
    slug: 'portfolio-overhaul',
    name: 'Portfolio Overhaul',
    shortName: 'Portfolio Overhaul',
    icon: '🔧',
    tagline: 'A professional review for investors who already have investments but no clear architecture.',
    positioning: "Already investing? Let's improve what you already own.",
    pillars: ['Review', 'Diversification', 'Alignment'],
    description: 'We clean up, restructure, and rebuild — consolidating fragmented holdings into a high-conviction allocation.',
    minInvestment: null,
    whyChoose: [
      'Comprehensive portfolio review',
      'Risk assessment across holdings',
      'Asset allocation review',
      'Consolidation of fragmented holdings',
      'Optimisation opportunities identified'
    ],
    whoFor: 'Investors with existing, scattered holdings across multiple platforms who want a single, high-conviction structure.',
    subcategories: [
      { name: 'Overlap Detection', desc: 'Identify duplicate or overlapping fund exposure.' },
      { name: 'Risk Assessment', desc: 'Evaluate concentration and downside risk.' },
      { name: 'Allocation Review', desc: 'Check alignment with your goals and horizon.' },
      { name: 'Consolidation Plan', desc: 'A single, structured plan to act on.' }
    ],
    howWeHelp: [
      { title: 'Map', desc: 'List out your existing holdings across platforms.' },
      { title: 'Diagnose', desc: 'Run the free Portfolio Health Check below.' },
      { title: 'Identify', desc: 'Flag overlap, gaps and concentration risk.' },
      { title: 'Rebuild', desc: 'Consolidate into one high-conviction allocation.' }
    ],
    eligibility: 'No minimum investment size — available to any investor with an existing portfolio to review.',
    ctaLabel: 'Get Portfolio Review',
    calculatorType: 'health-check',
    tags: ['Clean-Up', 'Restructure', 'Consolidate', 'Rebuild'],
    comparison: {
      idealFor: 'Investors with existing, scattered holdings',
      approach: 'Review and restructure existing investments',
      riskProfile: 'Depends on existing holdings',
      timeHorizon: 'One-time review + ongoing',
      professionalManagement: 'Yes — advisory led',
      portfolioReview: 'Immediate, then quarterly'
    }
  }
];

window.TF_GOALS = [
  {
    id: 'grow',
    title: 'Grow My Wealth',
    desc: 'For long-term capital growth.',
    icon: '📈',
    productIds: ['pms', 'mutual-funds', 'aif']
  },
  {
    id: 'income',
    title: 'Generate Income',
    desc: 'For income-oriented wealth strategies.',
    icon: '💵',
    productIds: ['mutual-funds', 'aif']
  },
  {
    id: 'protect',
    title: 'Protect My Wealth',
    desc: 'For wealth protection and risk management.',
    icon: '🛡️',
    productIds: ['mutual-funds', 'portfolio-overhaul']
  },
  {
    id: 'optimise',
    title: 'Optimise My Existing Portfolio',
    desc: 'For investors who already have investments and want professional portfolio review.',
    icon: '🎯',
    productIds: ['portfolio-overhaul']
  }
];

window.TF_STATS = [
  { value: '16+', label: 'Years of Experience', numeric: 16, suffix: '+', placeholder: false },
  { value: '100+', label: 'Ultra HNIs Served', numeric: 100, suffix: '+', placeholder: false },
  { value: '4', label: 'Investment Solutions', numeric: 4, suffix: '', placeholder: false },
  { value: 'AMFI · APMI', label: 'ARN-360113 · APRN09086', numeric: null, placeholder: false, isText: true }
];

window.TF_PROCESS = [
  { step: '01', title: 'Understand', desc: 'Understand your goals, financial position and risk profile.' },
  { step: '02', title: 'Strategise', desc: 'Create an investment strategy and asset allocation approach.' },
  { step: '03', title: 'Execute', desc: 'Implement the selected investment solutions.' },
  { step: '04', title: 'Monitor', desc: 'Review, track and optimise the portfolio over time.' }
];

window.TF_STRATEGY_FLOW = [
  { title: 'Strategy', desc: 'Define an approach suited to your goals and risk profile.' },
  { title: 'Allocation', desc: 'Translate strategy into a structured asset allocation.' },
  { title: 'Monitoring', desc: 'Track performance and market conditions continuously.' },
  { title: 'Review', desc: 'Revisit and rebalance as goals or markets shift.' }
];

window.TF_FEE_VALUE = [
  { icon: '🧭', title: 'Professional Management', desc: 'Your allocation is actively managed, not left on autopilot.' },
  { icon: '🔎', title: 'Research', desc: 'Strategy and fund selection backed by ongoing research.' },
  { icon: '📈', title: 'Portfolio Monitoring', desc: 'Continuous tracking of your holdings against your goals.' },
  { icon: '🔄', title: 'Reviews', desc: 'Scheduled reviews to catch drift before it compounds.' },
  { icon: '🤝', title: 'Advisory Support', desc: 'Direct access to a wealth strategist, not a call centre.' }
];

window.TF_STANDARDS = [
  { icon: '🎯', title: 'Selective By Design', desc: 'We work with a limited number of clients so every portfolio gets full attention, not a queue.' },
  { icon: '🧾', title: 'Full Transparency', desc: 'You always know what you hold, why you hold it, and what it costs — no hidden structures.' },
  { icon: '📞', title: 'Direct Access', desc: 'You reach your wealth strategist directly, not a rotating call-centre relationship manager.' },
  { icon: '🔁', title: 'Scheduled Reviews', desc: 'Quarterly reviews are built into the process, not left to happen only when you ask.' }
];

window.TF_PRODUCT_FAQ = [
  { q: 'What is Portfolio Management Service (PMS)?', a: 'PMS is a professionally managed, personalised investment portfolio held directly in your name — distinct from pooled mutual fund units. SEBI mandates a minimum investment of ₹50 lakh.' },
  { q: 'Who is PMS suitable for?', a: 'Investors with ₹50L+ investable surplus who want a concentrated, professionally managed equity portfolio and are comfortable with moderate-to-high risk over a 5+ year horizon.' },
  { q: 'What are Mutual Funds?', a: 'Mutual funds pool money from many investors into a professionally managed scheme across equity, debt, hybrid or international categories. There is no strict minimum investment.' },
  { q: 'What is AIF?', a: 'Alternative Investment Funds (Cat I, II, III) offer access to strategies beyond traditional mutual funds and PMS, including structured debt and pre-IPO opportunities. SEBI mandates a minimum investment of ₹1 crore.' },
  { q: 'What is Portfolio Overhaul?', a: 'A professional review of your existing, scattered investments — detecting overlap, assessing risk, and consolidating into one high-conviction allocation. No minimum investment size.' },
  { q: 'How do I choose the right investment solution?', a: 'Start with the goal selector above, or take our free Risk Profile assessment and Portfolio Health Check — both are designed to point you to the right solution before you speak to us.' },
  { q: 'How does the consultation process work?', a: 'You share your goals and current holdings, our wealth strategist reviews them, and you get a tailored recommendation — free, with no obligation to invest.' },
  { q: 'What documents are required?', a: 'Standard SEBI/AMFI-mandated KYC (PAN and address proof) applies across products. Specific onboarding documentation is confirmed during your consultation.' },
  { q: 'Can NRIs invest?', a: 'Yes, we work with NRI clients across time zones for remote consultations and access to our PMS, Mutual Fund and AIF solutions.' },
  { q: 'How can I speak to an advisor?', a: 'Use any "Talk to an Advisor" or "Book a Wealth Consultation" button on this page, or reach us directly — our team responds within 2 hours during business hours.' }
];
