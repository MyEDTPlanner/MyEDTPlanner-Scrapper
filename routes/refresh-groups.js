
const express = require('express');
const router = express.Router();

const OFilCrawler = require('../controllers/OFilCrawler');

// Retrieve groups
router.get('/', async (req, res) => {
    let crawler = new OFilCrawler();
    //res.header("Access-Control-Allow-Origin", "*");
    //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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