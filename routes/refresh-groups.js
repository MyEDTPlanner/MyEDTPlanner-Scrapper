
const express = require('express');
const router = express.Router();

const OFilCrawler = require('../controllers/OFilCrawler');

// Retrieve groups
router.get('/', async (req, res) => {
    let crawler = new OFilCrawler();

    try {
        let result = await crawler.getGroups()
        res.send({
            result: result,
            success: true,
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

module.exports = router;