const express = require('express');
const { protect } = require('../MIDDLEWARE/authMiddleware');
const {
    parseCsv,
    generatePlotData,
    groupByColumn,
    publishAnalysis,
    saveAnalysis,
    getAnalyses,
    getAnalysis,
    updateAnalysis,
    deleteAnalysis
} = require('../CONTROLLERS/dataAnalysisController');

const router = express.Router();

// All routes are protected
router.post('/csv-uploads', protect, parseCsv);
router.post('/plot-data', protect, generatePlotData);
router.post('/groupby', protect, groupByColumn);
router.post('/analyses', protect, saveAnalysis);
router.get('/analyses', protect, getAnalyses);
router.post('/publish-analysis', protect, publishAnalysis);
router.get('/analyses', protect, getAnalyses);
router.get('/analyses/:id', protect, getAnalysis);
router.put('/analyses/:id', protect, updateAnalysis);
router.delete('/analyses/:id', protect, deleteAnalysis);
router.post('/publish-analysis', protect, publishAnalysis);

module.exports = router;
