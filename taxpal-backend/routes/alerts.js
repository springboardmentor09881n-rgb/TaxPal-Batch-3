const express = require('express');
const Alert = require('../models/Alert');
const authMiddleware = require('../middleware/auth');
const { getUserAlerts, getUnreadCount } = require('../utils/alertService');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const alerts = await getUserAlerts(req.userId);
    const unreadCount = await getUnreadCount(req.userId);
    res.json({ alerts, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load alerts', error: error.message });
  }
});

router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await Alert.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update alerts', error: error.message });
  }
});

router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert marked as read', alert });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update alert', error: error.message });
  }
});

module.exports = router;
