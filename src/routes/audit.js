/**
 * 操作紀錄 API
 * GET /api/audit           - 查詢紀錄（支援 from/to/user/action/limit）
 */
const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../lib/auth-store');
const audit = require('../services/audit-log');

router.use(requireAdmin);

router.get('/', (req, res) => {
  const { from, to, user, action, limit } = req.query;
  const entries = audit.query({ from, to, user, action, limit: limit ? parseInt(limit, 10) : 100 });
  res.json({ entries, total: entries.length });
});

module.exports = router;
