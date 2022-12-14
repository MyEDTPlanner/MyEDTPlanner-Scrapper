const express = require('express');
const app = express();
const dotenv = require('dotenv');

dotenv.config();

const indexRouter = require('./routes/index');
const refreshEventsRouter = require('./routes/refresh-events');
const refreshGroupsRouter = require('./routes/refresh-groups');
const port = process.env.PORT || 2001;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Routes d'entrée du projet.
app.use('/', indexRouter);
app.use('/refresh-events', refreshEventsRouter);
app.use('/refresh-groups', refreshGroupsRouter);

app.get('*', (req, res) => {
    return res.send({
        success: false,
        error: 'Route unknown',
    })
});

app.listen(port, () => {
    console.log(`Scrapper is listening on port ${port}`)
});

module.exports = app;