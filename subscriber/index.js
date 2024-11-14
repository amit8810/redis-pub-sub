import express, { urlencoded, json } from 'express'
import { createClient } from 'redis'

const app = express();
const PORT = 3001
const CHANNEL_NAME = "channel1";
const REDIS_URL_CONNECTION = "redis://localhost:6379"

app.use(urlencoded({ extended: false }));
app.use(json());


const messageStorage = [];

const redisClient = createClient({ url:  REDIS_URL_CONNECTION});
redisClient.on('error', (err) => {
    console.log('Redis client Error', err);
})


redisClient.subscribe(CHANNEL_NAME, (message) => {
    console.log('Catching an Event using Redis to: '+ message);
    messageStorage.push(JSON.parse(message))
})


app.get("/messages", (_, res) => {
    try {
        return res.status(200).json({
            messages: messageStorage,
        })
    } catch (err) {
        return res.status(500).json({
            error: err
        })
    }
})



redisClient.connect()
.then(() => {
    console.log('Redis connected')
    console.log('subscriber this side 🧏')
    app.listen(PORT, () => {
        console.log(`server is listening at port: ${PORT}`)
    })
})