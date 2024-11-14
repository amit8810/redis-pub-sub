import express, { urlencoded, json } from 'express'
import { v4 } from 'uuid'
import { createClient } from 'redis'

const app = express();
const PORT = 3000;
const REDIS_URL_CONNECTION = "redis://localhost:6379"
const CHANNEL_NAME = "channel1"

app.use(urlencoded({ extended: false }));
app.use(json());

const redisClient = createClient({ url:  REDIS_URL_CONNECTION });
redisClient.on('error', err => console.log('Redis client Error', err));


app.post('/testRedis', (req, res) => {
    try {
        const { message } = req.body;

        if(!message || message.trim() === ''){
            return res.status(400).json({
                statusCode: 400,
                message: "The message is mandatory"
            })

        }

        const customMssg = {
            id: v4(),
            message: message,
            date: new Intl.DateTimeFormat('es-ES').format(new Date())
        }

        redisClient.publish(CHANNEL_NAME, JSON.stringify(message))

        return res.status(200).json({
            success: true,
            data: customMssg,
            details: 'Publishing an Event using Redis successful'
        })
        
    } catch (error) {
        return res.status(500).json({
            message: "Intenal Server Error",
            error: error
        })
    }
})


redisClient.connect()
.then(() => {
    console.log('Redis connected')
    console.log('Publisher this side 📢')
    app.listen(PORT, () => {
        console.log(`server is listening at port: ${PORT}`)
    })
})