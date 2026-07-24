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
        {
          month: 6,
          day: 15,
          cumulativePercentage: 15,
          label: 'First Advance Tax Instalment'
        },
        {
          month: 9,
          day: 15,
          cumulativePercentage: 45,
          label: 'Second Advance Tax Instalment'
        },
        {
          month: 12,
          day: 15,
          cumulativePercentage: 75,
          label: 'Third Advance Tax Instalment'
        },
        {
          month: 3,
          day: 15,
          cumulativePercentage: 100,
          label: 'Final Advance Tax Instalment'
        }
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

  const yearRules = countryRules[taxYear];

  if (!yearRules) {
    return null;
  }

  const regime = yearRules.regimes[taxRegime];

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
          ? `Above INR ${previousLimit.toLocaleString('en-IN')}`
          : `INR ${previousLimit.toLocaleString('en-IN')} - INR ${slab.limit.toLocaleString('en-IN')}`,
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