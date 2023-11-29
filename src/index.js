import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import rootRouter from './routes/index.js';
import { prisma, redisClient } from "./adapters.js";
import RedisStore from "connect-redis"
import crypto from 'crypto';
import cors from 'cors';

const port = process.env.PORT || 8000;

const app = express();
if( redisClient.isOpen ){
    console.log(`Redis is listening at 6379 port`)
}

app.use(express.json({limit: '1mb'}));
// CORS middleware, origin change to be frontend
app.use(cors({credentials: true, origin: process.env.FRONTEND_URL}));

const token = crypto.randomBytes(128).toString('hex');

// Production
if( process.env.NODE_ENV === 'production' ){
    app.set('trust proxy', 1);
}
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        name: "sessionId", // don't omit this option
        secret: token,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: null, // session cookie
        },
    })
);
app.use(cookieParser());
app.use(rootRouter);

app.get("/", (req, res) => {
    res.send("HELLO MEOW!");
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

process.on('exit', async () => {
    await prisma.$disconnect();
    await redisClient.quit();
})


/*
app.use(
    session({
        cookie: {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: null, // session cookie
        },
        // use random secret
        name: "sessionId", // don't omit this option
        secret: token,
        resave: false,
        saveUninitialized: false,
    })
);
*/