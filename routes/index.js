const express = require('express')
const router = express.Router()
const projectInfo = require('../package.json')

router.get('/', (req, res) => {
    res.send({
        success: true,
        version: projectInfo.version,
    })
})

module.exports = router