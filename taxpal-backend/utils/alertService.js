const Alert = require('../models/Alert');

const TAX_REMINDER_DAYS = 30;

async function syncTaxAlerts(userId, calendar = []) {
  const now = new Date();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + TAX_REMINDER_DAYS);

  for (const item of calendar) {
    if (item.status !== 'upcoming') continue;

    const dueDate = new Date(item.dueDate);
    if (dueDate < now || dueDate > horizon) continue;

    const message = `${item.quarter} estimated tax payment due on ${item.label}`;
    await Alert.findOneAndUpdate(
      { userId, type: 'tax', message, alertDate: dueDate },
      { isRead: false },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

async function syncBudgetAlerts(userId, budgetProgress = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const budget of budgetProgress) {
    if (budget.status === 'ok') continue;

    const message =
      budget.status === 'over'
        ? `Budget exceeded for ${budget.category}: spent ₹${budget.spent} of ₹${budget.limit}`
        : `Budget warning for ${budget.category}: ${budget.percent}% used`;

    await Alert.findOneAndUpdate(
      { userId, type: 'budget', message, alertDate: today },
      { isRead: false },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

async function syncUserAlerts(userId, { calendar = [], budgetProgress = [] } = {}) {
  await syncTaxAlerts(userId, calendar);
  await syncBudgetAlerts(userId, budgetProgress);
}

async function getUserAlerts(userId, limit = 20) {
  return Alert.find({ userId }).sort({ alertDate: 1, createdAt: -1 }).limit(limit);
}

async function getUnreadCount(userId) {
  return Alert.countDocuments({ userId, isRead: false });
}

module.exports = {
  syncUserAlerts,
  getUserAlerts,
  getUnreadCount,
};
