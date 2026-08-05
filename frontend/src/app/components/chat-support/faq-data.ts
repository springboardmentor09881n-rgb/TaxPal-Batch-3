export interface FAQ {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQ[] = [
  {
    question: 'How do I create a budget?',
    answer: 'To create a budget, navigate to the Budgets page from the sidebar. Select a Month and Year, enter your budget amount, and select a category. Click "Save Budget".'
  },
  {
    question: 'How do I edit a budget?',
    answer: 'On the Budgets page, find the budget you want to edit in the list below the chart and click the "Edit" button next to it. Update the amount and click "Update Budget".'
  },
  {
    question: 'How do I delete a budget?',
    answer: 'On the Budgets page, find the budget in the list and click the "Delete" button. Confirm your action when prompted.'
  },
  {
    question: 'How do categories work?',
    answer: 'Categories are used to organize your budgets and transactions. You can create Income and Expense categories to track exactly where your money comes from and goes to.'
  },
  {
    question: 'How do I add a category?',
    answer: 'Navigate to the Category Management page. Enter a category name and optional description, select whether it is an Income or Expense, and click "Add Category".'
  },
  {
    question: 'How do I edit a category?',
    answer: 'On the Category Management page, click "Edit" next to the category in the list. Make your changes and click "Update Category".'
  },
  {
    question: 'How do I add a transaction?',
    answer: 'Go to the Transactions page. Fill out the amount, select the date, choose a category, and optionally add a description. Then click the "Save Transaction" button.'
  },
  {
    question: 'How do I edit a transaction?',
    answer: 'On the Transactions page, click the "Edit" button next to any transaction in the list. Modify the details and click "Update Transaction".'
  },
  {
    question: 'How do reports work?',
    answer: 'The Reports page gives you a visual breakdown of your finances. You can filter by date range and view charts showing your income versus expenses and spending by category.'
  },
  {
    question: 'What is the dashboard?',
    answer: 'The Dashboard gives you an at-a-glance overview of your financial health, including total balance, recent transactions, and quick summaries.'
  },
  {
    question: 'Why can\'t I create another budget for the same category?',
    answer: 'To keep your tracking accurate, the system only allows one budget per category per month. You can edit the existing budget if you need to change the amount.'
  },
  {
    question: 'How do I contact support?',
    answer: 'For further assistance, please email support@expensetracker.com or call our help desk.'
  }
];
