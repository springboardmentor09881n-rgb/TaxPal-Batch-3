const QUARTERLY_DUE_DATES = {
  Q1: { month: 6, day: 15, label: 'June 15' },
  Q2: { month: 9, day: 15, label: 'September 15' },
  Q3: { month: 12, day: 15, label: 'December 15' },
  Q4: { month: 3, day: 15, label: 'March 15 (next year)' },
};

function getQuarter(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month <= 3) return 'Q4';
  if (month <= 6) return 'Q1';
  if (month <= 9) return 'Q2';
  return 'Q3';
}

function getFiscalYear(date = new Date()) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return month <= 3 ? year - 1 : year;
}

function calculateIndiaTax(annualTaxableIncome) {
  const income = Math.max(0, annualTaxableIncome);
  const slabs = [
    { upto: 300000, rate: 0 },
    { upto: 700000, rate: 0.05 },
    { upto: 1000000, rate: 0.1 },
    { upto: 1200000, rate: 0.15 },
    { upto: 1500000, rate: 0.2 },
    { upto: Infinity, rate: 0.3 },
  ];

  let tax = 0;
  let previous = 0;

  for (const slab of slabs) {
    const taxable = Math.min(income, slab.upto) - previous;
    if (taxable <= 0) break;
    tax += taxable * slab.rate;
    previous = slab.upto;
  }

  return Math.round(tax);
}

function calculateUsTax(annualTaxableIncome) {
  const income = Math.max(0, annualTaxableIncome);
  const slabs = [
    { upto: 11600, rate: 0.1 },
    { upto: 47150, rate: 0.12 },
    { upto: 100525, rate: 0.22 },
    { upto: 191950, rate: 0.24 },
    { upto: 243725, rate: 0.32 },
    { upto: 609350, rate: 0.35 },
    { upto: Infinity, rate: 0.37 },
  ];

  let tax = 0;
  let previous = 0;

  for (const slab of slabs) {
    const taxable = Math.min(income, slab.upto) - previous;
    if (taxable <= 0) break;
    tax += taxable * slab.rate;
    previous = slab.upto;
  }

  return Math.round(tax);
}

function calculateUkTax(annualTaxableIncome) {
  const income = Math.max(0, annualTaxableIncome);
  const personalAllowance = 12570;
  const taxable = Math.max(0, income - personalAllowance);

  let tax = 0;
  const basic = Math.min(taxable, 37700);
  tax += basic * 0.2;
  const higher = Math.min(Math.max(taxable - 37700, 0), 87440);
  tax += higher * 0.4;
  const additional = Math.max(taxable - 125140, 0);
  tax += additional * 0.45;

  return Math.round(tax);
}

function calculateEstimatedTax(country, annualTaxableIncome) {
  const normalized = (country || '').toLowerCase();

  if (normalized.includes('india') || normalized === 'in') {
    return calculateIndiaTax(annualTaxableIncome);
  }
  if (normalized.includes('united states') || normalized.includes('usa') || normalized === 'us') {
    return calculateUsTax(annualTaxableIncome);
  }
  if (normalized.includes('united kingdom') || normalized.includes('uk') || normalized.includes('britain')) {
    return calculateUkTax(annualTaxableIncome);
  }

  const rate = annualTaxableIncome > 1000000 ? 0.3 : annualTaxableIncome > 500000 ? 0.2 : 0.1;
  return Math.round(annualTaxableIncome * rate);
}

function buildTaxCalendar(year = new Date().getFullYear()) {
  return Object.entries(QUARTERLY_DUE_DATES).map(([quarter, due]) => {
    const dueYear = quarter === 'Q4' ? year + 1 : year;
    const dueDate = new Date(dueYear, due.month - 1, due.day);
    return {
      quarter,
      dueDate: dueDate.toISOString(),
      label: due.label,
      status: dueDate < new Date() ? 'past' : 'upcoming',
    };
  });
}

module.exports = {
  QUARTERLY_DUE_DATES,
  getQuarter,
  getFiscalYear,
  calculateEstimatedTax,
  buildTaxCalendar,
};
