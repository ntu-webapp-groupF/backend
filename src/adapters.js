import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

import { createClient } from 'redis';
export const redisClient = await createClient({
    socket: {
        port: 6379,
        host: 'redis_db',
    }
}).connect();