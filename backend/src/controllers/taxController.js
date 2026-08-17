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
      filingStatus,
      quarter,
      annualGrossIncome,
      grossIncome,
      deductions
    } = req.body;

    if (!country) {
      return res.status(400).json({
        message: 'Country is required'
      });
    }

    const numericAnnualGrossIncome = Number(annualGrossIncome) || 0;
    const numericGrossIncome = Number(grossIncome) || 0;

    if (numericAnnualGrossIncome < numericGrossIncome) {
      return res.status(400).json({
        message: 'Annual Gross Income cannot be less than Quarterly Gross Income'
      });
    }

    if (numericAnnualGrossIncome < 0 || numericGrossIncome < 0) {
      return res.status(400).json({
        message: 'Incomes must be 0 or greater'
      });
    }

    let totalDeductions = 0;
    if (deductions) {
      totalDeductions = 
        (Number(deductions.businessExpenses) || 0) + 
        (Number(deductions.retirementContributions) || 0) + 
        (Number(deductions.healthInsurance) || 0) + 
        (Number(deductions.homeOffice) || 0);
    }

    const numericAnnualTaxableIncome = Math.max(0, numericAnnualGrossIncome - totalDeductions);

    const normalizedCountry = country.trim();
    const normalizedRegion = region?.trim() || '';
    const normalizedTaxYear = taxYear?.trim() || 'FY 2025-26';
    const normalizedTaxRegime = filingStatus?.trim() || taxRegime?.trim() || 'Single';
    const normalizedFilingStatus = filingStatus?.trim() || '';
    const normalizedQuarter = quarter?.trim() || '';

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
      estimatedTax: estimatedAnnualTax,
      slabBreakdown
    } = calculateSlabTax(
      numericAnnualTaxableIncome,
      taxRule.slabs
    );

    const effectiveTaxRate =
      numericAnnualTaxableIncome > 0
        ? (estimatedAnnualTax / numericAnnualTaxableIncome) * 100
        : 0;

    const estimatedQuarterlyTax = numericAnnualGrossIncome > 0 
      ? estimatedAnnualTax * (numericGrossIncome / numericAnnualGrossIncome)
      : 0;

    return res.status(200).json({
      country: normalizedCountry,
      region: normalizedRegion,
      taxYear: normalizedTaxYear,
      taxRegime: normalizedTaxRegime,
      filingStatus: normalizedFilingStatus,
      quarter: normalizedQuarter,
      taxRegimeLabel: taxRule.label,
      annualGrossIncome: numericAnnualGrossIncome,
      grossIncome: numericGrossIncome,
      deductions: deductions || {},
      taxableIncome: numericAnnualTaxableIncome,
      estimatedAnnualTax,
      estimatedQuarterlyTax,
      estimatedTax: estimatedAnnualTax, // for legacy usage
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
      filingStatus,
      quarter,
      annualGrossIncome,
      grossIncome,
      deductions
    } = req.body;

    if (!country) {
      return res.status(400).json({
        message: 'Country is required'
      });
    }

    const numericAnnualGrossIncome = Number(annualGrossIncome) || 0;
    const numericGrossIncome = Number(grossIncome) || 0;

    if (numericAnnualGrossIncome < numericGrossIncome) {
      return res.status(400).json({
        message: 'Annual Gross Income cannot be less than Quarterly Gross Income'
      });
    }

    if (numericAnnualGrossIncome < 0 || numericGrossIncome < 0) {
      return res.status(400).json({
        message: 'Incomes must be 0 or greater'
      });
    }

    let totalDeductions = 0;
    if (deductions) {
      totalDeductions = 
        (Number(deductions.businessExpenses) || 0) + 
        (Number(deductions.retirementContributions) || 0) + 
        (Number(deductions.healthInsurance) || 0) + 
        (Number(deductions.homeOffice) || 0);
    }

    const numericAnnualTaxableIncome = Math.max(0, numericAnnualGrossIncome - totalDeductions);

    const normalizedCountry = country.trim();
    const normalizedRegion = region?.trim() || '';
    const normalizedTaxYear = taxYear?.trim() || 'FY 2025-26';
    const normalizedTaxRegime = filingStatus?.trim() || taxRegime?.trim() || 'Single';
    const normalizedFilingStatus = filingStatus?.trim() || '';
    const normalizedQuarter = quarter?.trim() || '';

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
      estimatedTax: estimatedAnnualTax,
      slabBreakdown
    } = calculateSlabTax(
      numericAnnualTaxableIncome,
      taxRule.slabs
    );

    const effectiveTaxRate =
      numericAnnualTaxableIncome > 0
        ? (estimatedAnnualTax / numericAnnualTaxableIncome) * 100
        : 0;
        
    const estimatedQuarterlyTax = numericAnnualGrossIncome > 0 
      ? estimatedAnnualTax * (numericGrossIncome / numericAnnualGrossIncome)
      : 0;

    const taxEstimate = await TaxEstimate.create({
      user: req.userId,
      country: normalizedCountry,
      region: normalizedRegion,
      taxYear: normalizedTaxYear,
      taxRegime: normalizedTaxRegime,
      filingStatus: normalizedFilingStatus,
      quarter: normalizedQuarter,
      annualGrossIncome: numericAnnualGrossIncome,
      grossIncome: numericGrossIncome,
      deductions: deductions || {},
      taxableIncome: numericAnnualTaxableIncome,
      estimatedAnnualTax,
      estimatedQuarterlyTax,
      estimatedTax: estimatedAnnualTax,
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
    const taxEstimate =
      await TaxEstimate.findOneAndDelete({
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