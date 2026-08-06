const TAX_RULES = {
  India: {
    'FY 2025-26': {
      regimes: {
        new: {
          label: 'New Tax Regime',
          slabs: [
            { limit: 400000, rate: 0 },
            { limit: 800000, rate: 5 },
            { limit: 1200000, rate: 10 },
            { limit: 1600000, rate: 15 },
            { limit: 2000000, rate: 20 },
            { limit: 2400000, rate: 25 },
            { limit: Infinity, rate: 30 }
          ]
        }
      },
      advanceTaxDueDates: [
        { month: 6, day: 15, label: 'First Advance Tax Instalment', percentage: 15 },
        { month: 9, day: 15, label: 'Second Advance Tax Instalment', percentage: 30 },
        { month: 12, day: 15, label: 'Third Advance Tax Instalment', percentage: 30 },
        { month: 3, day: 15, label: 'Final Advance Tax Instalment', percentage: 25 }
      ]
    }
  },
  'United States': {
    'FY 2025-26': {
      regimes: {
        Single: {
          label: 'Single',
          slabs: [
            { limit: 11000, rate: 10 },
            { limit: 44725, rate: 12 },
            { limit: 95375, rate: 22 },
            { limit: 182100, rate: 24 },
            { limit: 231250, rate: 32 },
            { limit: 578125, rate: 35 },
            { limit: Infinity, rate: 37 }
          ]
        }
      },
      advanceTaxDueDates: [
        { month: 4, day: 15, label: 'Q1 Estimated Tax Payment', percentage: 25 },
        { month: 6, day: 15, label: 'Q2 Estimated Tax Payment', percentage: 25 },
        { month: 9, day: 15, label: 'Q3 Estimated Tax Payment', percentage: 25 },
        { month: 1, day: 15, label: 'Q4 Estimated Tax Payment', percentage: 25 }
      ]
    }
  },
  Canada: {
    'FY 2025-26': {
      regimes: {
        Single: {
          label: 'Single',
          slabs: [
            { limit: 53359, rate: 15 },
            { limit: 106717, rate: 20.5 },
            { limit: 165430, rate: 26 },
            { limit: 235675, rate: 29 },
            { limit: Infinity, rate: 33 }
          ]
        }
      },
      advanceTaxDueDates: [
        { month: 3, day: 15, label: 'Q1 Instalment', percentage: 25 },
        { month: 6, day: 15, label: 'Q2 Instalment', percentage: 25 },
        { month: 9, day: 15, label: 'Q3 Instalment', percentage: 25 },
        { month: 12, day: 15, label: 'Q4 Instalment', percentage: 25 }
      ]
    }
  },
  'United Kingdom': {
    'FY 2025-26': {
      regimes: {
        Single: {
          label: 'Single',
          slabs: [
            { limit: 12570, rate: 0 },
            { limit: 50270, rate: 20 },
            { limit: 125140, rate: 40 },
            { limit: Infinity, rate: 45 }
          ]
        }
      },
      advanceTaxDueDates: [
        { month: 1, day: 31, label: 'First Payment on Account', percentage: 50 },
        { month: 7, day: 31, label: 'Second Payment on Account', percentage: 50 }
      ]
    }
  },
  Australia: {
    'FY 2025-26': {
      regimes: {
        Single: {
          label: 'Resident',
          slabs: [
            { limit: 18200, rate: 0 },
            { limit: 45000, rate: 19 },
            { limit: 120000, rate: 32.5 },
            { limit: 180000, rate: 37 },
            { limit: Infinity, rate: 45 }
          ]
        }
      },
      advanceTaxDueDates: [
        { month: 10, day: 28, label: 'Q1 BAS', percentage: 25 },
        { month: 2, day: 28, label: 'Q2 BAS', percentage: 25 },
        { month: 4, day: 28, label: 'Q3 BAS', percentage: 25 },
        { month: 7, day: 28, label: 'Q4 BAS', percentage: 25 }
      ]
    }
  },
  Germany: {
    'FY 2025-26': {
      regimes: {
        Single: {
          label: 'Single',
          slabs: [
            { limit: 10908, rate: 0 },
            { limit: 62810, rate: 14 },
            { limit: 277826, rate: 42 },
            { limit: Infinity, rate: 45 }
          ]
        }
      },
      advanceTaxDueDates: [
        { month: 3, day: 10, label: 'Q1 Prepayment', percentage: 25 },
        { month: 6, day: 10, label: 'Q2 Prepayment', percentage: 25 },
        { month: 9, day: 10, label: 'Q3 Prepayment', percentage: 25 },
        { month: 12, day: 10, label: 'Q4 Prepayment', percentage: 25 }
      ]
    }
  },
  Singapore: {
    'FY 2025-26': {
      regimes: {
        Single: {
          label: 'Resident',
          slabs: [
            { limit: 20000, rate: 0 },
            { limit: 30000, rate: 2 },
            { limit: 40000, rate: 3.5 },
            { limit: 80000, rate: 7 },
            { limit: 120000, rate: 11.5 },
            { limit: 160000, rate: 15 },
            { limit: 200000, rate: 18 },
            { limit: 240000, rate: 19 },
            { limit: 280000, rate: 19.5 },
            { limit: 320000, rate: 20 },
            { limit: Infinity, rate: 22 }
          ]
        }
      },
      advanceTaxDueDates: [
        { month: 4, day: 15, label: 'Income Tax Return Due', percentage: 100 }
      ]
    }
  },
  UAE: {
    'FY 2025-26': {
      regimes: {
        Single: {
          label: 'Corporate Tax',
          slabs: [
            { limit: 375000, rate: 0 },
            { limit: Infinity, rate: 9 }
          ]
        }
      },
      advanceTaxDueDates: [
        { month: 9, day: 30, label: 'Tax Return & Payment', percentage: 100 }
      ]
    }
  },
  France: {
    'FY 2025-26': {
      regimes: {
        Single: {
          label: 'Single',
          slabs: [
            { limit: 10777, rate: 0 },
            { limit: 27478, rate: 11 },
            { limit: 78570, rate: 30 },
            { limit: 168994, rate: 41 },
            { limit: Infinity, rate: 45 }
          ]
        }
      },
      advanceTaxDueDates: [
        { month: 2, day: 15, label: 'First Instalment', percentage: 33.33 },
        { month: 5, day: 15, label: 'Second Instalment', percentage: 33.33 },
        { month: 9, day: 15, label: 'Balance Payment', percentage: 33.34 }
      ]
    }
  },
  Japan: {
    'FY 2025-26': {
      regimes: {
        Single: {
          label: 'Resident',
          slabs: [
            { limit: 1950000, rate: 5 },
            { limit: 3300000, rate: 10 },
            { limit: 6950000, rate: 20 },
            { limit: 9000000, rate: 23 },
            { limit: 18000000, rate: 33 },
            { limit: 40000000, rate: 40 },
            { limit: Infinity, rate: 45 }
          ]
        }
      },
      advanceTaxDueDates: [
        { month: 7, day: 31, label: 'First Prepayment', percentage: 33.33 },
        { month: 11, day: 30, label: 'Second Prepayment', percentage: 33.33 },
        { month: 3, day: 15, label: 'Final Tax Return', percentage: 33.34 }
      ]
    }
  }
};

const getTaxRule = (
  country,
  taxYear,
  taxRegime
) => {
  const countryRules = TAX_RULES[country];
  if (!countryRules) {
    return null;
  }

  // Fallback to FY 2025-26 if year not provided or not found
  const yearRules = countryRules[taxYear] || countryRules['FY 2025-26'];
  if (!yearRules) {
    return null;
  }

  // Fallback to a default regime if provided one is not found
  const regimeKeys = Object.keys(yearRules.regimes);
  const regime = yearRules.regimes[taxRegime] || yearRules.regimes[regimeKeys[0]];
  if (!regime) {
    return null;
  }

  return {
    ...regime,
    advanceTaxDueDates: yearRules.advanceTaxDueDates
  };
};

const calculateSlabTax = (
  taxableIncome,
  slabs
) => {
  let remainingIncome = taxableIncome;
  let previousLimit = 0;
  let totalTax = 0;
  const slabBreakdown = [];

  for (const slab of slabs) {
    if (remainingIncome <= 0) {
      break;
    }

    const slabCapacity =
      slab.limit === Infinity
        ? remainingIncome
        : slab.limit - previousLimit;

    const taxableAmount = Math.min(
      remainingIncome,
      slabCapacity
    );

    const taxAmount =
      taxableAmount * (slab.rate / 100);

    slabBreakdown.push({
      label:
        slab.limit === Infinity
          ? `Above ${previousLimit.toLocaleString()}`
          : `${previousLimit.toLocaleString()} - ${slab.limit.toLocaleString()}`,
      taxableAmount,
      rate: slab.rate,
      taxAmount
    });

    totalTax += taxAmount;
    remainingIncome -= taxableAmount;

    if (slab.limit !== Infinity) {
      previousLimit = slab.limit;
    }
  }

  return {
    estimatedTax: totalTax,
    slabBreakdown
  };
};

module.exports = {
  TAX_RULES,
  getTaxRule,
  calculateSlabTax
};