const INCOME_CATEGORIES = ['freelance', 'consulting', 'salary', 'investments', 'other'];
const EXPENSE_CATEGORIES = [
  'groceries',
  'rent',
  'utilities',
  'transport',
  'healthcare',
  'entertainment',
  'business',
  'other',
];

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

function suggestCategory(description = '', type = 'expense', poolOverride) {
  const text = description.toLowerCase();
  const pool = poolOverride || (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES);

  const rules = [
    { keywords: ['rent', 'lease', 'housing'], category: 'rent' },
    { keywords: ['grocery', 'food', 'supermarket'], category: 'groceries' },
    { keywords: ['uber', 'fuel', 'cab', 'metro', 'transport'], category: 'transport' },
    { keywords: ['electric', 'water', 'internet', 'wifi', 'utility'], category: 'utilities' },
    { keywords: ['doctor', 'medicine', 'hospital', 'health'], category: 'healthcare' },
    { keywords: ['movie', 'netflix', 'game', 'entertainment'], category: 'entertainment' },
    { keywords: ['client', 'invoice', 'freelance', 'project'], category: 'freelance' },
    { keywords: ['consult', 'advisory'], category: 'consulting' },
    { keywords: ['salary', 'payroll'], category: 'salary' },
    { keywords: ['software', 'laptop', 'office', 'business'], category: 'business' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((word) => text.includes(word))) {
      if (pool.includes(rule.category)) {
        return rule.category;
      }
    }
  }

  return type === 'income' ? 'freelance' : 'other';
}

module.exports = {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  ALL_CATEGORIES,
  suggestCategory,
};
