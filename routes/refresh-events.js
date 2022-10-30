
const e = require('express');
const express = require('express');
const router = express.Router();

const EDTCrawler = require('../controllers/EDTCrawler');

// Get events
router.get('/:_group', async (req, res) => {
    const { _group } = req.params;

    if(_group != null) {
        let parser = new EDTCrawler(_group);

        try {
            await parser.init();
            res.send({
                result: parser.getFinalCoursesList(),
                success: true,
            });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
    else {
        res.status(400).json({ error: 'Missing group' });
    }
});

module.exports = router;