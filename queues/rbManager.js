const amqp = require('amqplib');

class QueueClient {

    constructor(rabbitUrl, opt, queueName) {
        this.connection = null
        this.channel = null
        this.retry = 0
        this.rabbitUrl = rabbitUrl;
        this.queueName = queueName;
        this.opt = opt;

    }

    async waitForConnection(interval = 1000, maxRetry) {
        console.log('... connecting to Queue ...')

        if (maxRetry > 0) {
            if (this.retry > maxRetry) {
                throw new Error('Exceeded Max Retry. Exiting ...')
            }
            this.retry++
        }

        try {
            await this.connect()
            console.log('... connected to Queue ...')
        } catch (err) {
            console.log('Could not connect to Queue, retrying...')
            await this.wait(interval)
            await this.waitForConnection(maxRetry)
        }
    }

    async wait(time) {
        return new Promise((resolve) => setTimeout(resolve, time))
    }


    async connect() {
        this.connection = await amqp.connect(this.rabbitUrl, this.opt);
        this.channel = await this.connection.createChannel();
        console.log('start assert queue');
        await this.channel.assertQueue(this.queueName);
        console.log('assert queue started');

        // return null
    }

    async disconnect() {
        await this.channel.close()
        await this.connection.close()
    }

    async produce(message) {
        if (!this.channel) {
            throw new Error('There is no connection to Queue')
        }

        await this.channel.sendToQueue(this.queueName, Buffer.from(message))
    }

    async rpcQueue(Blog, clearHash, keyClear) {
        this.channel.prefetch(1);

        console.log('[x] Awaiting RPC requests');

        this.channel.consume(this.queueName, (msg) => {
            console.log('[.] data message', msg.content.toString());

            const r = { "userID": "duythole", "user_display_name": "Duy Tho Le"};

            const jsonData = JSON.stringify(r);
            console.log('[.] data message jsonData', jsonData);

            if (jsonData == msg.content.toString()) {
                console.log('[.] compare success!!!');

                const title = "Title " + msg.content.toString();
                const content = "This is content blog " + msg.content.toString();

                const blog = new Blog({
                    title,
                    content
                });

                blog.save();

                clearHash(keyClear);

                console.log('[.] msg.properties.correlationId', msg.properties.correlationId);

                this.channel.sendToQueue(msg.properties.replyTo,
                    Buffer.from(msg.content.toString()),
                    {
                        correlationId: msg.properties.correlationId
                    });

                this.channel.ack(msg);
            }

            // this.channel.ack(msg)
        })
    }

    async directQueue(severity) {

        const exchange = 'direct_logs';
        const msg = 'Start write ' + severity + ' on your system.!!!';

        // const severity = 'info';

        this.channel.assertExchange(exchange, 'direct', {
            durable: false
        });

        this.channel.publish(exchange, severity, Buffer.from(msg));

        console.log('[x] Send %s, %s', severity, msg);
    }

}

module.exports = QueueClient;