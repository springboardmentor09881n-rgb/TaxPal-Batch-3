const SuggestedCategory = require('../models/SuggestedCategory');

const DEFAULT_CATEGORIES = [
  { name: 'freelance', type: 'income', description: 'Freelance project payments' },
  { name: 'consulting', type: 'income', description: 'Consulting and advisory income' },
  { name: 'salary', type: 'income', description: 'Salary or payroll income' },
  { name: 'investments', type: 'income', description: 'Investment returns' },
  { name: 'other', type: 'income', description: 'Other income sources' },
  { name: 'groceries', type: 'expense', description: 'Food and groceries' },
  { name: 'rent', type: 'expense', description: 'Rent and housing' },
  { name: 'utilities', type: 'expense', description: 'Electricity, water, internet' },
  { name: 'transport', type: 'expense', description: 'Travel and commute' },
  { name: 'healthcare', type: 'expense', description: 'Medical and health expenses' },
  { name: 'entertainment', type: 'expense', description: 'Movies, subscriptions, leisure' },
  { name: 'business', type: 'expense', description: 'Software, equipment, office' },
  { name: 'other', type: 'expense', description: 'Other expenses' },
];

async function seedSuggestedCategories() {
  for (const category of DEFAULT_CATEGORIES) {
    await SuggestedCategory.updateOne(
      { name: category.name, type: category.type },
      { $set: category },
      { upsert: true }
    );
  }
  const count = await SuggestedCategory.countDocuments();
  console.log(`Suggested categories in DB: ${count}`);
  return count;
}

async function getCategoryLists() {
  let categories = await SuggestedCategory.find().sort({ type: 1, name: 1 }).lean();

  if (categories.length === 0) {
    await seedSuggestedCategories();
    categories = await SuggestedCategory.find().sort({ type: 1, name: 1 }).lean();
  }

  if (categories.length === 0) {
    return {
      income: DEFAULT_CATEGORIES.filter((c) => c.type === 'income').map((c) => c.name),
      expense: DEFAULT_CATEGORIES.filter((c) => c.type === 'expense').map((c) => c.name),
      all: DEFAULT_CATEGORIES,
    };
  }

  return {
    income: categories.filter((c) => c.type === 'income').map((c) => c.name),
    expense: categories.filter((c) => c.type === 'expense').map((c) => c.name),
    all: categories,
  };
}

module.exports = {
  DEFAULT_CATEGORIES,
  seedSuggestedCategories,
  getCategoryLists,
};
