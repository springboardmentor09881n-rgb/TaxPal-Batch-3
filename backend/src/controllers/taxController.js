const TaxEstimate = require('../models/TaxEstimate');

const {
  getTaxRule,
  calculateSlabTax
} = require('../utils/taxRules');

const calculateTax = async (req, res) => {
  try {
    const {
      country,
      region,
      taxYear,
      taxRegime,
      taxableIncome
    } = req.body;

    if (
      !country ||
      !taxYear ||
      !taxRegime ||
      taxableIncome === undefined
    ) {
      return res.status(400).json({
        message:
          'Country, tax year, tax regime, and taxable income are required'
      });
    }

    const numericIncome = Number(taxableIncome);

    if (
      !Number.isFinite(numericIncome) ||
      numericIncome < 0
    ) {
      return res.status(400).json({
        message: 'Taxable income must be 0 or greater'
      });
    }

    const normalizedCountry = country.trim();
    const normalizedRegion = region?.trim() || '';
    const normalizedTaxYear = taxYear.trim();
    const normalizedTaxRegime = taxRegime.trim();

    const taxRule = getTaxRule(
      normalizedCountry,
      normalizedTaxYear,
      normalizedTaxRegime
    );

    if (!taxRule) {
      return res.status(400).json({
        message:
          'Tax rules are not available for the selected country, tax year, or regime'
      });
    }

    const {
      estimatedTax,
      slabBreakdown
    } = calculateSlabTax(
      numericIncome,
      taxRule.slabs
    );

    const effectiveTaxRate =
      numericIncome > 0
        ? (estimatedTax / numericIncome) * 100
        : 0;

    return res.status(200).json({
      country: normalizedCountry,
      region: normalizedRegion,
      taxYear: normalizedTaxYear,
      taxRegime: normalizedTaxRegime,
      taxRegimeLabel: taxRule.label,
      taxableIncome: numericIncome,
      estimatedTax,
      effectiveTaxRate,
      slabBreakdown,
      advanceTaxDueDates: taxRule.advanceTaxDueDates
    });

  } catch (error) {
    console.error(
      'Calculate tax error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error while calculating tax'
    });
  }
};

const saveTaxEstimate = async (req, res) => {
  try {
    const {
      country,
      region,
      taxYear,
      taxRegime,
      taxableIncome
    } = req.body;

    if (
      !country ||
      !taxYear ||
      !taxRegime ||
      taxableIncome === undefined
    ) {
      return res.status(400).json({
        message:
          'Country, tax year, tax regime, and taxable income are required'
      });
    }

    const numericIncome = Number(taxableIncome);

    if (
      !Number.isFinite(numericIncome) ||
      numericIncome < 0
    ) {
      return res.status(400).json({
        message: 'Taxable income must be 0 or greater'
      });
    }

    const normalizedCountry = country.trim();
    const normalizedRegion = region?.trim() || '';
    const normalizedTaxYear = taxYear.trim();
    const normalizedTaxRegime = taxRegime.trim();

    const taxRule = getTaxRule(
      normalizedCountry,
      normalizedTaxYear,
      normalizedTaxRegime
    );

    if (!taxRule) {
      return res.status(400).json({
        message:
          'Tax rules are not available for the selected country, tax year, or regime'
      });
    }

    const {
      estimatedTax,
      slabBreakdown
    } = calculateSlabTax(
      numericIncome,
      taxRule.slabs
    );

    const effectiveTaxRate =
      numericIncome > 0
        ? (estimatedTax / numericIncome) * 100
        : 0;

    const taxEstimate = await TaxEstimate.create({
      user: req.userId,
      country: normalizedCountry,
      region: normalizedRegion,
      taxYear: normalizedTaxYear,
      taxRegime: normalizedTaxRegime,
      taxableIncome: numericIncome,
      estimatedTax,
      effectiveTaxRate,
      slabBreakdown
    });

    return res.status(201).json({
      message: 'Tax estimate saved successfully',
      taxEstimate
    });

  } catch (error) {
    console.error(
      'Save tax estimate error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error while saving tax estimate'
    });
  }
};

const getTaxEstimates = async (req, res) => {
  try {
    const taxEstimates = await TaxEstimate.find({
      user: req.userId
    }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      count: taxEstimates.length,
      taxEstimates
    });

  } catch (error) {
    console.error(
      'Get tax estimates error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error while fetching tax estimates'
    });
  }
};

const deleteTaxEstimate = async (req, res) => {
  try {
    const taxEstimate = await TaxEstimate.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!taxEstimate) {
      return res.status(404).json({
        message: 'Tax estimate not found'
      });
    }

    return res.status(200).json({
      message: 'Tax estimate deleted successfully'
    });

  } catch (error) {
    console.error(
      'Delete tax estimate error:',
      error.message
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid tax estimate ID'
      });
    }

    return res.status(500).json({
      message: 'Server error while deleting tax estimate'
    });
  }
};

module.exports = {
  calculateTax,
  saveTaxEstimate,
  getTaxEstimates,
  deleteTaxEstimate
};