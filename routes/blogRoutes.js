const mongoose = require('mongoose');

const { clearHash } = require('../services/cache');
const clearCache = require('../middleware/clearCache');
const Blog = mongoose.model('Blog');

module.exports = (app, producer) => {

    app.get('/', async (req, res) => {
        res.json({ status: true, message: 'success on port 5000' });
    });

    app.get('/test', async (req, res) => {
        res.json({ status: true, message: 'success on port 5000' });
    });


    app.get('/api/blogs', async (req, res) => {
        const blogs = await Blog.find().cache({
            key: 'blogs'
        });

        res.send(blogs);
    });

    app.get('/api/blogs/count', async (req, res) => {

        const countItem = await Blog.countDocuments();

        res.send({ data: countItem });
    });

    app.get('/api/blogs/create', clearCache, async (req, res) => {

        const title = "Title " + Date.now.toString();
        const content = "This is content blog " + Date.now.toString();

        const blog = new Blog({
            title,
            content
        });

        try {
            await blog.save();
            res.send(blog);
        } catch (err) {
            res.send(400, err);
        }
    });


    app.get('/api/rabbit/direct', async (req, res) => {

        try {
            const severity = req.query.key;
            console.log('severity: %s', severity);
            await producer.directQueue(severity);
            res.json({ status: true, message: 'Success start direct queue with key: ' + severity });
        } catch (err) {
            res.send(400, err);
        }
    });

    app.get('/api/rabbit/rpc', async (req, res) => {

        try {
            await producer.rpcQueue(Blog, clearHash, 'blogs');
            res.json({ status: true, message: 'Success start rpc queue' });
        } catch (err) {
            res.send(400, err);
        }
    });
}