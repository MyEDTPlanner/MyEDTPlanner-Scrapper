
const express = require('express');
const router = express.Router();

const EDTCrawler = require('../controllers/EDTCrawler');

// Get events
router.get('/:_group', async (req, res) => {
    const { _group } = req.params;

    let parser = new EDTCrawler(_group);

    // Réaliser la récupération des données (synchrone, lent)
    await parser.init();

    res.send({
        result: parser.getFinalCoursesList(),
        success: true,
    });
});

module.exports = router;