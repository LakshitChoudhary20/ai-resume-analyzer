const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const { analyzeResume, getHistory } = require('../controllers/resume.controller');

// Analyze resume — auth optional (guest mode supported)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) return authMiddleware(req, res, next);
  next();
};

router.post('/analyze', optionalAuth, upload.single('resume'), analyzeResume);
router.get('/history', authMiddleware, getHistory);

module.exports = router;
