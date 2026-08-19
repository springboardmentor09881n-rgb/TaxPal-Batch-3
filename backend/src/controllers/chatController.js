const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// Rule-based live financial analytics engine as instant fallback
const generateLocalFinancialAnswer = (message, transactions = [], budgets = []) => {
  const rawQuery = (message || '').trim();
  const query = rawQuery.toLowerCase();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // 1. HOW-TO / APP USAGE QUESTIONS
  if (query.includes('add') && (query.includes('trans') || query.includes('trabs') || query.includes('income') || query.includes('expense'))) {
    return `To add a transaction in TaxPal:\n\n1. Click **Transactions** in the left sidebar.\n2. Select whether it is an **Income** or **Expense**.\n3. Enter the amount (₹).\n4. Choose a suggested category (or type a new custom category).\n5. Pick the date and add an optional description.\n6. Click **Add Transaction** to save it.`;
  }

  if (query.includes('delete') && query.includes('trans')) {
    return `To delete a transaction:\n\n1. Go to the **Transactions** page.\n2. In the **Transaction History** panel on the right, find the transaction you wish to remove.\n3. Click the red **Delete** button next to it.`;
  }

  if ((query.includes('how') || query.includes('create') || query.includes('set')) && (query.includes('budget') || query.includes('limit'))) {
    return `To set up a monthly budget:\n\n1. Click **Budgets** in the sidebar menu.\n2. Under 'Create Budget', select or enter the category (e.g. Food & Dining, Travel, Shopping).\n3. Enter your monthly spending limit in ₹.\n4. Click **Create Budget**. TaxPal will track your progress and alert you if you are approaching or exceeding your limit!`;
  }

  if ((query.includes('how') || query.includes('export') || query.includes('download') || query.includes('generate')) && (query.includes('report') || query.includes('pdf') || query.includes('excel') || query.includes('csv'))) {
    return `To generate and download reports:\n\n1. Navigate to the **Reports** section in the sidebar.\n2. Choose the **Report Type** (e.g., Income vs Expense, Category Breakdown, Annual Tax Summary).\n3. Select the **Period** and desired **Format** (PDF, CSV, or formatted Excel spreadsheet).\n4. Click **Generate Report** to preview and download your statement.`;
  }

  if ((query.includes('how') || query.includes('calculate')) && (query.includes('tax') || query.includes('deduction') || query.includes('slab'))) {
    return `To estimate your income tax:\n\n1. Open the **Tax Calculator** tab in the sidebar.\n2. Enter your Annual Gross Income, standard deductions, and Section 80C/80D investments.\n3. TaxPal instantly calculates your taxable income, tax bracket breakdown, and net liability under the New Tax Regime!`;
  }

  if (query.includes('profile') || query.includes('photo') || query.includes('avatar') || query.includes('password') || query.includes('picture')) {
    return `To update your profile or change your password:\n\n1. Click **Settings** in the bottom sidebar.\n2. Click directly on your **Profile Icon** to pick a photo from your computer.\n3. Update your name, phone number, address, or password and click **Save**.`;
  }

  if (query.includes('dark mode') || query.includes('theme') || query.includes('light mode')) {
    return `You can toggle between **Dark Mode** and **Light Mode** at any time by clicking the Sun (☀️) / Moon (🌙) button located on the top navbar right beside your profile name!`;
  }

  // Current month transactions
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncomeAll = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenseAll = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const currentBalance = totalIncomeAll - totalExpenseAll;

  // Category spending helper
  const getCategorySpending = (catPattern) => {
    return currentMonthTransactions
      .filter(t => t.type === 'expense' && catPattern.test(t.category))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  // 2. Budget / Over-budget queries
  if (query.includes('budget') || query.includes('over budget') || query.includes('limit')) {
    const categoriesToCheck = ['travel', 'transportation', 'food', 'dining', 'housing', 'rent', 'entertainment', 'shopping', 'utilities', 'healthcare'];
    const matchedCategory = categoriesToCheck.find(cat => query.includes(cat));

    if (matchedCategory) {
      const regex = new RegExp(matchedCategory, 'i');
      const spent = getCategorySpending(regex);
      const budgetObj = budgets.find(b => regex.test(b.category) && Number(b.month) === currentMonth && Number(b.year) === currentYear)
        || budgets.find(b => regex.test(b.category));

      if (budgetObj) {
        const limit = Number(budgetObj.monthlyLimit) || 0;
        const diff = limit - spent;
        if (diff < 0) {
          return `⚠️ Yes, you are over budget for **${budgetObj.category}**. You have spent **₹${spent.toLocaleString()}** against your monthly limit of **₹${limit.toLocaleString()}** (Over budget by ₹${Math.abs(diff).toLocaleString()}).`;
        } else {
          return `✅ Good news! You are currently within budget for **${budgetObj.category}**. You have spent **₹${spent.toLocaleString()}** out of your **₹${limit.toLocaleString()}** limit (₹${diff.toLocaleString()} remaining).`;
        }
      } else {
        if (spent > 0) {
          return `You have spent **₹${spent.toLocaleString()}** on **${matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1)}** this month. You haven't configured a monthly budget limit for this category yet.`;
        } else {
          return `You haven't recorded any **${matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1)}** expenses this month, and no budget limit is set.`;
        }
      }
    }

    if (budgets.length === 0) {
      return `You haven't configured any monthly budgets yet. You can set category limits in the **Budgets** section to monitor your spending!`;
    }

    const budgetStatusList = budgets.map(b => {
      const spent = getCategorySpending(new RegExp(b.category, 'i'));
      const limit = Number(b.monthlyLimit) || 0;
      const status = spent > limit ? `⚠️ Over by ₹${spent - limit}` : `✅ ₹${limit - spent} left`;
      return `- **${b.category}**: Spent ₹${spent.toLocaleString()} / Limit ₹${limit.toLocaleString()} (${status})`;
    }).join('\n');

    return `Here is your current budget summary for this month:\n\n${budgetStatusList}`;
  }

  // 3. Food & Dining spending
  if (query.includes('food') || query.includes('dining') || query.includes('restaurant') || query.includes('groceries')) {
    const foodSpent = getCategorySpending(/food|dining|grocery|groceries|restaurant|eat/i);
    return `You have spent **₹${foodSpent.toLocaleString()}** on Food & Dining this month.`;
  }

  // 4. Balance / Net worth queries
  if (query.includes('balance') || query.includes('current balance') || query.includes('how much do i have') || query.includes('net savings')) {
    return `Your current net balance is **₹${currentBalance.toLocaleString()}** (Total Income: ₹${totalIncomeAll.toLocaleString()} - Total Expenses: ₹${totalExpenseAll.toLocaleString()}).`;
  }

  // 5. Income queries
  if (query.includes('income') || query.includes('salary') || query.includes('earned')) {
    if (query.includes('last month') || query.includes('previous month')) {
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const lastMonthIncome = transactions
        .filter(t => {
          const d = new Date(t.date);
          return t.type === 'income' && (d.getMonth() + 1) === prevMonth && d.getFullYear() === prevYear;
        })
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      if (lastMonthIncome > 0) {
        return `Your total income for last month was **₹${lastMonthIncome.toLocaleString()}**.`;
      } else {
        return `No income transactions were recorded for last month. Your all-time total recorded income is **₹${totalIncomeAll.toLocaleString()}**.`;
      }
    }

    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return `Your recorded income for this month is **₹${currentMonthIncome.toLocaleString()}** (All-time recorded income: ₹${totalIncomeAll.toLocaleString()}).`;
  }

  // 6. Total Expenses
  if (query.includes('total expense') || query.includes('total spend') || query.includes('how much did i spend')) {
    const currentMonthExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return `You have spent **₹${currentMonthExpense.toLocaleString()}** in total this month across all categories.`;
  }

  // 7. Tax related queries
  if (query.includes('tax') || query.includes('slab') || query.includes('deduction') || query.includes('80c')) {
    return `In India (New Tax Regime FY 2024-25), income up to ₹3 Lakhs is tax-free (0%), ₹3L - ₹6L is 5%, ₹6L - ₹9L is 10%, ₹9L - ₹12L is 15%, ₹12L - ₹15L is 20%, and above ₹15L is 30%. With the standard deduction and Section 87A rebate, annual income up to ₹7 Lakhs has ₹0 effective tax liability!`;
  }

  // Default response
  if (transactions.length > 0) {
    return `I can help you analyze your finances! You currently have **${transactions.length}** recorded transactions and an overall balance of **₹${currentBalance.toLocaleString()}**.\n\nTry asking me:\n- *"Am I over budget on travel?"*\n- *"How much did I spend on food this month?"*\n- *"What was my total income last month?"*\n- *"How to add a transaction?"*`;
  }

  return `I am your TaxPal AI Financial Assistant. You can ask me how to use any feature (adding transactions, budgets, reports, tax calculator) or ask about your spending and budgets!`;
};

const chatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: 'Message is required'
      });
    }

    let transactions = [];
    let budgets = [];

    if (req.userId && mongoose.Types.ObjectId.isValid(req.userId)) {
      try {
        transactions = await Transaction.find({ user: req.userId })
          .sort({ date: -1 })
          .limit(60)
          .lean();
          
        budgets = await Budget.find({ user: req.userId }).lean();
      } catch (dbErr) {
        console.warn('Error loading financial context in chat:', dbErr.message);
      }
    }

    // If Gemini key is missing or calls take too long, use local analytical assistant
    if (!process.env.GEMINI_API_KEY) {
      const fallbackAnswer = generateLocalFinancialAnswer(message, transactions, budgets);
      return res.status(200).json({ answer: fallbackAnswer });
    }

    // Format data into context
    const transactionContext = transactions.map(t => 
      `- ${new Date(t.date).toISOString().split('T')[0]}: ${t.type.toUpperCase()} of ₹${t.amount} in category "${t.category}" (${t.description || 'No description'})`
    ).join('\n');

    const budgetContext = budgets.map(b => 
      `- ${b.month}/${b.year}: Category "${b.category}", Limit: ₹${b.monthlyLimit}`
    ).join('\n');

    const prompt = `
You are a highly intelligent and helpful Financial Assistant AI for a personal finance app called "TaxPal".
The user is asking you a question about their finances. 

Here is their recent data for context:
Recent Transactions:
${transactionContext || 'No recent transactions.'}

Budgets:
${budgetContext || 'No budgets configured.'}

User's Question:
"${message}"

Instructions:
1. Answer the user's question directly, clearly, and concisely.
2. If they ask about their spending or budgets, calculate the answer from the transaction and budget data provided.
3. If they ask a general financial question, answer it helpfully.
4. Format cleanly using conversational text.
    `;

    // Attempt Gemini with a 3.5s timeout race
    const geminiPromise = (async () => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    })();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 3500)
    );

    try {
      const text = await Promise.race([geminiPromise, timeoutPromise]);
      return res.status(200).json({ answer: text });
    } catch (aiError) {
      console.warn('Gemini AI unavailable or timed out, falling back to local financial engine:', aiError.message);
      const fallbackAnswer = generateLocalFinancialAnswer(message, transactions, budgets);
      return res.status(200).json({ answer: fallbackAnswer });
    }

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      message: 'Server error while processing chat message'
    });
  }
};

module.exports = {
  chatMessage
};
