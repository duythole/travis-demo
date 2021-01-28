const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
const QueueClient = require('./queues/rbManager');

const opt = { credentials: require('amqplib').credentials.plain(keys.rabbitUser, keys.rabbitPassword) };

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
require('./models/Blog');
require('./services/cache');


function startWebServer(producer) {

    const app = express();

    app.use(bodyParser.json());

    require('./routes/blogRoutes')(app, producer);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log('Listening on port', PORT);
    });
}

async function start() {

    const producer = new QueueClient(keys.rabbitUrl, opt, keys.queueName);

    try {
        await producer.waitForConnection(1000);
        startWebServer(producer);
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}

start();