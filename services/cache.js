const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const { redisPort } = require('../config/keys');
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);

//override data for client redis
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');

    return this;
};

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache)
        return exec.apply(this, arguments);

    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );

    //see if have key redis
    const cacheValue = await client.hget(this.hashKey, key);

    //check value if exist
    if (cacheValue) {
        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc) ?
            doc.map(d => new this.model(d)) :
            this.model(doc);
    }

    const result = await exec.apply(this, arguments);

    //cache data to redis
    client.hset(this.hashKey, key, JSON.stringify(result));

    return result;

};

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}