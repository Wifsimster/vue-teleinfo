const fastify = require('fastify')({ logger: true })
const config = require('../config')
const MongoClient = require('mongodb').MongoClient
const mongoUrl = `mongodb://${config.mongo.host}:${config.mongo.port}/`
const client = new MongoClient(mongoUrl)
const PORT = 3001

fastify.get('/linky', async (request, reply) => {
  try {
    const db = client.db(config.mongo.db)
    const linky = db.collection('linky')
    const options = {
      sort: { createdAt: -1 },
      projection: {
        createdAt: 1,
        index: 1,
        instantaneousIntensity01: 1,
        instantaneousIntensity02: 1,
        instantaneousIntensity03: 1,
      },
    }

    const cursor = linky.find({}, options)

    if ((await cursor.count()) === 0) {
      return 'No documents found!'
    }

    return await cursor.toArray()
  } catch (err) {
    return err
  }
})

const start = async () => {
  try {
    await client.connect()
    await fastify.listen(PORT)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
